import Stripe from 'stripe';
import pool from '../config/database';
import { log } from '../utils/logger';

// Initialize Stripe with API key from environment
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  log.warn('STRIPE_SECRET_KEY not set - payment processing will fail');
}

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' })
  : null;

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

export interface CreatePaymentIntentRequest {
  userId: number;
  courseId: string;
  amount: number;
  currency?: string;
}

export interface PaymentServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Payment service for handling Stripe integration
 * Follows security best practices:
 * - Server-side payment processing only
 * - No client secrets in frontend
 * - Idempotency for duplicate requests
 * - Webhook signature verification
 */
class PaymentService {
  /**
   * Create a Stripe Payment Intent for course purchase
   * @param request Payment intent request details
   * @returns Payment intent with client secret for frontend
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest
  ): Promise<PaymentServiceResponse<PaymentIntent>> {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment provider not configured',
      };
    }

    try {
      const { userId, courseId, amount, currency = 'usd' } = request;

      // Validate course exists and get details
      const courseResult = await pool.query(
        'SELECT id, title, price FROM courses WHERE course_id = $1 AND is_active = true',
        [courseId]
      );

      if (courseResult.rows.length === 0) {
        return {
          success: false,
          error: 'Course not found',
        };
      }

      const course = courseResult.rows[0];

      // Verify amount matches course price (prevent price manipulation)
      const coursePrice = typeof course.price === 'string' 
        ? parseFloat(course.price) 
        : Number(course.price || 0);

      if (Math.abs(amount - coursePrice) > 0.01) {
        log.warn('Payment amount mismatch', { userId, courseId, requested: amount, expected: coursePrice });
        return {
          success: false,
          error: 'Invalid payment amount',
        };
      }

      // Check if already purchased
      const existingPurchase = await pool.query(
        'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
        [userId, course.id]
      );

      if (existingPurchase.rows.length > 0) {
        return {
          success: false,
          error: 'Course already purchased',
        };
      }

      // Create Payment Intent with idempotency key
      const idempotencyKey = `${userId}-${courseId}-${Date.now()}`;
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency,
          metadata: {
            userId: userId.toString(),
            courseId,
            courseTitle: course.title,
            internalCourseId: course.id.toString(),
          },
          description: `Purchase of course: ${course.title}`,
        },
        {
          idempotencyKey,
        }
      );

      // Store payment intent in database for tracking
      await pool.query(
        `INSERT INTO payment_intents (
          payment_intent_id, user_id, course_id, amount, currency, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [paymentIntent.id, userId, course.id, amount, currency, paymentIntent.status]
      );

      log.info('Payment intent created', {
        paymentIntentId: paymentIntent.id,
        userId,
        courseId,
        amount,
      });

      return {
        success: true,
        data: {
          id: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          status: paymentIntent.status,
          clientSecret: paymentIntent.client_secret!,
        },
      };
    } catch (error) {
      log.error('Failed to create payment intent', { error, request });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * Verify webhook signature from Stripe
   * @param payload Raw request body
   * @param signature Stripe signature header
   * @returns Verified Stripe event or null
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): Stripe.Event | null {
    if (!stripe) {
      log.error('Stripe not initialized for webhook verification');
      return null;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      log.error('STRIPE_WEBHOOK_SECRET not configured');
      return null;
    }

    try {
      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      log.error('Webhook signature verification failed', { error });
      return null;
    }
  }

  /**
   * Handle successful payment completion
   * Creates user_course record when payment is confirmed
   * @param paymentIntent Stripe Payment Intent object
   */
  async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const { userId, courseId, internalCourseId } = paymentIntent.metadata;

      if (!userId || !courseId || !internalCourseId) {
        log.error('Missing metadata in payment intent', { paymentIntentId: paymentIntent.id });
        return;
      }

      // Check if already recorded (idempotency)
      const existing = await pool.query(
        'SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2',
        [parseInt(userId), parseInt(internalCourseId)]
      );

      if (existing.rows.length > 0) {
        log.warn('Purchase already recorded', { userId, courseId });
        return;
      }

      // Record the purchase
      await pool.query(
        `INSERT INTO user_courses (
          user_id, course_id, payment_amount, payment_status, payment_intent_id, purchased_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
        [
          parseInt(userId),
          parseInt(internalCourseId),
          paymentIntent.amount / 100,
          'completed',
          paymentIntent.id,
        ]
      );

      // Update payment intent status in our database
      await pool.query(
        'UPDATE payment_intents SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE payment_intent_id = $2',
        ['succeeded', paymentIntent.id]
      );

      log.audit('course_purchased', userId, {
        courseId,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
      });
    } catch (error) {
      log.error('Failed to handle payment success', { error, paymentIntentId: paymentIntent.id });
      throw error;
    }
  }

  /**
   * Handle failed payment
   * Updates payment intent status
   * @param paymentIntent Stripe Payment Intent object
   */
  async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      await pool.query(
        'UPDATE payment_intents SET status = $1, failed_at = CURRENT_TIMESTAMP WHERE payment_intent_id = $2',
        ['failed', paymentIntent.id]
      );

      log.warn('Payment failed', {
        paymentIntentId: paymentIntent.id,
        userId: paymentIntent.metadata.userId,
        courseId: paymentIntent.metadata.courseId,
      });
    } catch (error) {
      log.error('Failed to handle payment failure', { error, paymentIntentId: paymentIntent.id });
    }
  }

  /**
   * Get payment intent status
   * @param paymentIntentId Stripe Payment Intent ID
   * @returns Payment intent status
   */
  async getPaymentStatus(paymentIntentId: string): Promise<PaymentServiceResponse<{ status: string }>> {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment provider not configured',
      };
    }

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      return {
        success: true,
        data: {
          status: paymentIntent.status,
        },
      };
    } catch (error) {
      log.error('Failed to get payment status', { error, paymentIntentId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retrieve payment status',
      };
    }
  }

  /**
   * Cancel a payment intent
   * @param paymentIntentId Stripe Payment Intent ID
   */
  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentServiceResponse> {
    if (!stripe) {
      return {
        success: false,
        error: 'Payment provider not configured',
      };
    }

    try {
      await stripe.paymentIntents.cancel(paymentIntentId);
      
      await pool.query(
        'UPDATE payment_intents SET status = $1, cancelled_at = CURRENT_TIMESTAMP WHERE payment_intent_id = $2',
        ['canceled', paymentIntentId]
      );

      log.info('Payment intent canceled', { paymentIntentId });

      return { success: true };
    } catch (error) {
      log.error('Failed to cancel payment intent', { error, paymentIntentId });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel payment',
      };
    }
  }
}

export default new PaymentService();
