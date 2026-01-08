import express, { Request, Response } from 'express';
import authMiddleware from '../middleware/auth';
import paymentService from '../services/paymentService';
import { log } from '../utils/logger';
import { StandardError, ValidationError } from '../utils/errorHandler';

const router = express.Router();

/**
 * POST /api/payment/create-intent
 * Create a Stripe Payment Intent for course purchase
 * Requires authentication
 */
router.post('/create-intent', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId, amount, currency } = req.body;

    // Validate request
    if (!courseId) {
      throw new ValidationError('courseId is required');
    }

    if (!amount || amount <= 0) {
      throw new ValidationError('Valid amount is required');
    }

    const userId = (req as any).userId;

    // Create payment intent
    const result = await paymentService.createPaymentIntent({
      userId,
      courseId,
      amount,
      currency: currency || 'usd',
    });

    if (!result.success) {
      throw new StandardError(result.error || 'Failed to create payment intent', 400);
    }

    log.info('Payment intent requested', { userId, courseId, amount }, req);

    res.json({
      success: true,
      paymentIntent: result.data,
    });
  } catch (error) {
    log.error('Create payment intent error', { error }, req);
    
    if (error instanceof ValidationError || error instanceof StandardError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

/**
 * GET /api/payment/status/:paymentIntentId
 * Get payment intent status
 * Requires authentication
 */
router.get('/status/:paymentIntentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new ValidationError('paymentIntentId is required');
    }

    const result = await paymentService.getPaymentStatus(paymentIntentId);

    if (!result.success) {
      throw new StandardError(result.error || 'Failed to get payment status', 400);
    }

    res.json({
      success: true,
      status: result.data?.status,
    });
  } catch (error) {
    log.error('Get payment status error', { error }, req);
    
    if (error instanceof ValidationError || error instanceof StandardError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

/**
 * POST /api/payment/cancel/:paymentIntentId
 * Cancel a payment intent
 * Requires authentication
 */
router.post('/cancel/:paymentIntentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    if (!paymentIntentId) {
      throw new ValidationError('paymentIntentId is required');
    }

    const result = await paymentService.cancelPaymentIntent(paymentIntentId);

    if (!result.success) {
      throw new StandardError(result.error || 'Failed to cancel payment', 400);
    }

    res.json({
      success: true,
      message: 'Payment canceled',
    });
  } catch (error) {
    log.error('Cancel payment error', { error }, req);
    
    if (error instanceof ValidationError || error instanceof StandardError) {
      res.status(error.statusCode).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Server error' });
    }
  }
});

/**
 * POST /api/payment/webhook
 * Stripe webhook endpoint for payment events
 * No authentication - verified by Stripe signature
 * 
 * IMPORTANT: This endpoint must receive RAW request body
 * Configure in server.ts to skip JSON body parser
 */
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req: Request, res: Response) => {
    try {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        log.warn('Webhook received without signature');
        return res.status(400).send('Missing signature');
      }

      // Verify webhook signature
      const event = paymentService.verifyWebhookSignature(req.body, signature);

      if (!event) {
        log.warn('Webhook signature verification failed');
        return res.status(400).send('Invalid signature');
      }

      log.info('Webhook received', { type: event.type, id: event.id });

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          await paymentService.handlePaymentSuccess(event.data.object as any);
          log.info('Payment succeeded webhook processed', { paymentIntentId: event.data.object.id });
          break;

        case 'payment_intent.payment_failed':
          await paymentService.handlePaymentFailure(event.data.object as any);
          log.warn('Payment failed webhook processed', { paymentIntentId: event.data.object.id });
          break;

        case 'payment_intent.canceled':
          await paymentService.handlePaymentFailure(event.data.object as any);
          log.info('Payment canceled webhook processed', { paymentIntentId: event.data.object.id });
          break;

        default:
          log.info('Unhandled webhook event type', { type: event.type });
      }

      // Return 200 to acknowledge receipt
      res.json({ received: true });
    } catch (error) {
      log.error('Webhook processing error', { error });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
);

export default router;
