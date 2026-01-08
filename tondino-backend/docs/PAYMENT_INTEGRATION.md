# Payment Integration Documentation

## Overview

Tondino uses **Stripe** as the payment gateway for processing course purchases. This document outlines the payment architecture, security considerations, implementation details, and integration guide.

## Architecture

### Components

1. **Payment Service** (`src/services/paymentService.ts`)
   - Server-side Stripe integration
   - Payment Intent creation and management
   - Webhook signature verification
   - Database synchronization

2. **Payment Routes** (`src/routes/payment.ts`)
   - REST API endpoints for payment operations
   - Webhook handler for Stripe events
   - Authentication and validation

3. **Database Schema** (`migrations/005_add_payment_intents.sql`)
   - `payment_intents` table for tracking Stripe Payment Intents
   - Extended `user_courses` table with `payment_intent_id`

### Payment Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Frontend  │         │   Backend   │         │    Stripe   │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                        │
       │  1. Request Payment   │                        │
       │──────────────────────>│                        │
       │    (courseId, amount) │                        │
       │                       │                        │
       │                       │  2. Create Payment     │
       │                       │       Intent           │
       │                       │───────────────────────>│
       │                       │                        │
       │                       │  3. Return client      │
       │                       │     secret             │
       │  4. Client secret     │<───────────────────────│
       │<──────────────────────│                        │
       │                       │                        │
       │  5. Confirm payment   │                        │
       │    (Stripe Elements)  │                        │
       │───────────────────────┼───────────────────────>│
       │                       │                        │
       │  6. Payment confirmed │                        │
       │<──────────────────────┼────────────────────────│
       │                       │                        │
       │                       │  7. Webhook event      │
       │                       │  (payment_intent.      │
       │                       │   succeeded)           │
       │                       │<───────────────────────│
       │                       │                        │
       │                       │  8. Create enrollment  │
       │                       │     (user_courses)     │
       │                       │                        │
       │  9. Verify purchase   │                        │
       │──────────────────────>│                        │
       │                       │                        │
       │ 10. Course access     │                        │
       │<──────────────────────│                        │
```

## API Endpoints

### POST /api/payment/create-intent
Create a Stripe Payment Intent for course purchase.

**Authentication:** Required

**Request:**
```json
{
  "courseId": "course-1",
  "amount": 99.99,
  "currency": "usd"
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx",
    "amount": 99.99,
    "currency": "usd",
    "status": "requires_payment_method",
    "clientSecret": "pi_xxx_secret_yyy"
  }
}
```

**Response (Error):**
```json
{
  "error": "Course already purchased"
}
```

### GET /api/payment/status/:paymentIntentId
Get the status of a payment intent.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "status": "succeeded"
}
```

### POST /api/payment/cancel/:paymentIntentId
Cancel a pending payment intent.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Payment canceled"
}
```

### POST /api/payment/webhook
Stripe webhook endpoint for payment events.

**Authentication:** Verified by Stripe signature

**Supported Events:**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment canceled

**Important:** This endpoint receives raw request body for signature verification. It's registered before the `express.json()` middleware in `server.ts`.

## Security Considerations

### 1. Server-Side Payment Processing
- **All payment operations happen server-side**
- Never expose Stripe Secret Key to frontend
- Client only receives `clientSecret` for specific payment intent

### 2. Webhook Signature Verification
- All webhook events are verified using Stripe signature
- Invalid signatures are rejected with 400 status
- Prevents replay attacks and unauthorized requests

### 3. Idempotency
- Payment Intent creation uses idempotency keys
- Prevents duplicate charges from network failures
- Database transactions ensure consistency

### 4. Amount Validation
- Server validates amount matches course price
- Prevents price manipulation from client
- Logs warning for amount mismatches

### 5. Purchase Verification
- Checks for existing purchases before creating payment intent
- Webhook handler includes idempotency check
- Prevents duplicate enrollments

### 6. Environment Variables
All sensitive configuration stored in environment variables:
```bash
STRIPE_SECRET_KEY=sk_test_...     # Never commit to git
STRIPE_WEBHOOK_SECRET=whsec_...   # Generated by Stripe CLI or Dashboard
```

### 7. Audit Logging
- All payment operations are logged with correlation IDs
- Audit trail for course purchases
- Security events logged for failed validations

## Database Schema

### payment_intents Table
```sql
CREATE TABLE payment_intents (
    id SERIAL PRIMARY KEY,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'usd',
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);
```

### user_courses Extension
```sql
ALTER TABLE user_courses 
ADD COLUMN payment_intent_id VARCHAR(255);
```

## Frontend Integration

### 1. Install Stripe.js
```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Setup Stripe Provider
```tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your app components */}
    </Elements>
  );
}
```

### 3. Payment Component
```tsx
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function PaymentForm({ courseId, amount }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Create Payment Intent
    const response = await fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ courseId, amount })
    });

    const { paymentIntent } = await response.json();

    // 2. Confirm payment with Stripe
    const { error } = await stripe.confirmCardPayment(
      paymentIntent.clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      }
    );

    if (error) {
      console.error('Payment failed:', error);
    } else {
      // Payment succeeded - webhook will handle enrollment
      console.log('Payment successful!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay ${amount}
      </button>
    </form>
  );
}
```

## Webhook Setup

### Development (Stripe CLI)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3001/api/payment/webhook

# Get webhook signing secret from output
# Add to .env: STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Production (Stripe Dashboard)
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Set URL: `https://your-domain.com/api/payment/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `payment_intent.canceled`
5. Copy webhook signing secret
6. Add to production environment: `STRIPE_WEBHOOK_SECRET=whsec_xxx`

## Testing

### Unit Tests
Run payment integration tests:
```bash
cd tondino-backend
npm test tests/payment.test.ts
```

### Stripe Test Cards
Use these test card numbers in development:

| Card Number         | Result                    |
|---------------------|---------------------------|
| 4242 4242 4242 4242 | Success                   |
| 4000 0000 0000 9995 | Decline (insufficient funds) |
| 4000 0000 0000 0002 | Decline (card declined)    |
| 4000 0025 0000 3155 | Requires authentication    |

**Test Card Details:**
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

### Test Webhook Locally
```bash
# Trigger test event
stripe trigger payment_intent.succeeded
```

## Migration Guide

### Apply Payment Schema
```bash
cd tondino-backend
npm run migrate:up
```

This applies migration `005_add_payment_intents.sql`.

### Rollback (if needed)
```bash
npm run migrate:down
```

## Error Handling

### Common Errors

1. **"Payment provider not configured"**
   - Cause: `STRIPE_SECRET_KEY` not set
   - Fix: Add Stripe key to environment variables

2. **"Invalid payment amount"**
   - Cause: Amount doesn't match course price
   - Fix: Ensure client sends correct amount from course data

3. **"Course already purchased"**
   - Cause: User already enrolled in course
   - Fix: Check purchase status before showing payment form

4. **"Invalid signature" (webhook)**
   - Cause: Webhook secret mismatch
   - Fix: Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard/CLI

### Error Response Format
All payment errors follow standard format:
```json
{
  "error": "Error message",
  "message": "User-friendly description",
  "hint": "Suggested action"
}
```

## Monitoring

### Key Metrics
- Payment success rate
- Average payment processing time
- Failed payment reasons
- Webhook processing latency

### Logs
All payment operations are logged with:
- Correlation ID for request tracing
- User ID and course ID
- Payment amount and currency
- Success/failure status

### Alerts
Configure alerts for:
- Payment failure rate > 10%
- Webhook processing failures
- Stripe API errors
- Amount validation mismatches

## Best Practices

1. **Never log sensitive data**
   - Card numbers, CVCs are handled by Stripe
   - Only log payment intent IDs

2. **Handle async webhook delivery**
   - Webhooks may arrive out of order
   - Use idempotency checks in database

3. **Implement retry logic**
   - Network failures can occur
   - Stripe automatically retries webhooks

4. **Use test mode keys in development**
   - Prefix: `sk_test_` for secret key
   - Prefix: `pk_test_` for publishable key

5. **Rotate keys on security incidents**
   - Generate new keys in Stripe Dashboard
   - Update environment variables
   - Restart servers

## Currency Support

Current implementation supports USD. To add multiple currencies:

1. Update payment service to accept currency parameter
2. Store course prices in multiple currencies
3. Use Stripe's automatic currency conversion
4. Display prices in user's local currency

## Future Enhancements

- [ ] Subscription support for recurring payments
- [ ] Refund processing
- [ ] Payment method saving for faster checkout
- [ ] Apple Pay / Google Pay integration
- [ ] Invoice generation
- [ ] Payment analytics dashboard
- [ ] Multiple currency support
- [ ] Discount codes and promotions
- [ ] Split payments (installments)

## Support

For payment integration issues:
1. Check Stripe Dashboard logs
2. Review application logs with correlation ID
3. Test with Stripe CLI in development
4. Contact Stripe support for API issues

## References

- [Stripe Payment Intents Guide](https://stripe.com/docs/payments/payment-intents)
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe.js Elements](https://stripe.com/docs/js)
- [Testing Stripe](https://stripe.com/docs/testing)
