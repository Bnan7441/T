# Tondino Backend API Contracts (courses)

This document describes the `courses` endpoints and their request/response contracts.

Base path: `/api/courses` (router exported by `src/routes/courses.ts`)

Authentication: Endpoints marked with **(auth)** require a valid JWT in the `Authorization: Bearer <token>` header.

---

## GET /stats  (auth)
- Description: Get or create the authenticated user's stats record.
- Request headers:
  - `Authorization: Bearer <token>`
- Response 200:
  {
    "stats": {
      "user_id": number,
      "top_speed": number,
      "points": number,
      "reading_minutes": number,
      "courses_completed": number,
      "current_streak": number,
      "created_at": string (ISO timestamp),
      "updated_at": string (ISO timestamp)
    }
  }
- Errors:
  - 401 Unauthorized — missing/invalid token
  - 500 Server error

## PUT /stats  (auth)
- Description: Partial update to the authenticated user's stats. Fields use `COALESCE` semantics (only provided values overwrite).
- Request body (JSON): any subset of
  - `top_speed` (number)
  - `points` (number)
  - `reading_minutes` (number)
  - `courses_completed` (number)
  - `current_streak` (number)
- Response 200:
  {
    "stats": { <updated stats object, same shape as GET /stats> }
  }
- Errors: 400 bad request if payload invalid, 401, 500

## POST /purchase/:courseId  (auth)
- Description: **UPDATED** - For free courses only. Paid courses must use the payment gateway flow. Records enrollment for free courses or returns error with payment instructions for paid courses.
- Path params:
  - `courseId` (string) — public `course_id` value
- Request headers: `Authorization: Bearer <token>`
- Request body: none required
- Response 200 (Free course):
  {
    "message": "Course enrolled successfully",
    "course": { "id": string, "title": string },
    "purchase": { "id": number, "purchased_at": string }
  }
- Response 400 (Paid course):
  {
    "error": "Payment required",
    "message": "Please use payment gateway for paid courses",
    "hint": "Create payment intent via POST /api/payment/create-intent"
  }
- Errors:
  - 400 `{ error: "Course already purchased" }` — user already has access
  - 404 `{ error: "Course not found" }`
  - 401 Unauthorized
  - 500 Server error

## GET /access/:courseId  (auth)
- Description: Check whether authenticated user has access to the course.
- Response 200 examples:
  - `{ "hasAccess": true, "reason": "free" }`
  - `{ "hasAccess": true, "reason": "purchased" }`
  - `{ "hasAccess": false }`

## GET /my-courses  (auth)
- Description: List courses the authenticated user purchased.
- Response 200:
  { "courses": [ { "course_id": string, "title": string, "description": string, "purchased_at": string } ] }

## Public endpoints (no auth)
- GET / — list active public courses
- GET /:id — get course details and syllabus (by internal numeric id)

---

## Payment Endpoints

Base path: `/api/payment` (router exported by `src/routes/payment.ts`)

### POST /create-intent  (auth)
- Description: Create a Stripe Payment Intent for course purchase
- Request headers: `Authorization: Bearer <token>`
- Request body (JSON):
  {
    "courseId": string,    // Course ID to purchase
    "amount": number,      // Course price (must match server price)
    "currency": string     // Optional, defaults to "usd"
  }
- Response 200:
  {
    "success": true,
    "paymentIntent": {
      "id": string,           // Payment Intent ID (pi_xxx)
      "amount": number,       // Amount in dollars
      "currency": string,     // Currency code
      "status": string,       // Payment status
      "clientSecret": string  // Client secret for Stripe.js
    }
  }
- Errors:
  - 400 `{ error: "Course already purchased" }`
  - 400 `{ error: "Invalid payment amount" }` — amount doesn't match course price
  - 401 Unauthorized
  - 404 `{ error: "Course not found" }`
  - 500 Server error

### GET /status/:paymentIntentId  (auth)
- Description: Get payment intent status
- Path params: `paymentIntentId` — Stripe Payment Intent ID
- Response 200:
  {
    "success": true,
    "status": string  // "requires_payment_method", "succeeded", etc.
  }
- Errors: 400, 401, 500

### POST /cancel/:paymentIntentId  (auth)
- Description: Cancel a pending payment intent
- Path params: `paymentIntentId` — Stripe Payment Intent ID
- Response 200:
  {
    "success": true,
    "message": "Payment canceled"
  }
- Errors: 400, 401, 500

### POST /webhook  (no auth, verified by Stripe signature)
- Description: Stripe webhook endpoint for payment events
- Request headers: `stripe-signature` — Stripe signature for verification
- Request body: Raw Stripe event payload
- Supported events:
  - `payment_intent.succeeded` — Creates user_courses enrollment
  - `payment_intent.payment_failed` — Updates payment status
  - `payment_intent.canceled` — Updates payment status
- Response 200: `{ "received": true }`
- Errors:
  - 400 `Missing signature` or `Invalid signature`
  - 500 Webhook processing failed

**Important:** Webhook endpoint must receive raw request body. It's registered before `express.json()` middleware in `server.ts`.

---

Notes & next steps:
- **Payment integration completed** with Stripe Payment Intents
- Webhook verification ensures secure payment processing
- See `docs/PAYMENT_INTEGRATION.md` for complete integration guide
- Frontend integration requires Stripe.js and Elements
- Test with Stripe CLI in development: `stripe listen --forward-to localhost:3001/api/payment/webhook`

Generated from API implementation (January 2026).