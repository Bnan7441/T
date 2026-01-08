# Tondino — Complete Learning Platform

![Secret Scan](https://github.com/<OWNER>/<REPO>/actions/workflows/secret-scan.yml/badge.svg)
![CI/CD](https://github.com/<OWNER>/<REPO>/actions/workflows/ci-cd.yml/badge.svg)

A production-ready TypeScript + React + PostgreSQL learning management system with integrated payment processing, real-time chat, and comprehensive monitoring.

---

## 📋 Table of Contents

- [What is Implemented](#-what-is-implemented)
- [What is NOT Implemented](#-what-is-not-implemented)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Architecture Overview](#-architecture-overview)
- [Build & Test Reports](#-build--test-reports)
- [Deployment](#-deployment)
- [Security](#-security)
- [Contributing](#-contributing)
- [Documentation](#-documentation)

---

## ✅ What is Implemented

### Core Features
- ✅ **User Authentication**: JWT-based auth with secure token management
- ✅ **Course Management**: Full CRUD operations, enrollment, progress tracking
- ✅ **Payment Processing**: Stripe integration with Payment Intents, webhooks, idempotency
- ✅ **Chat System**: Server-backed multi-session chat with actor-based state management
- ✅ **User Statistics**: Real-time progress tracking and analytics
- ✅ **Admin Dashboard**: User management, course administration, system monitoring

### Technical Implementation
- ✅ **Database**: PostgreSQL with SQL migrations, rollback support, proper schema management
- ✅ **API**: RESTful backend with standardized error handling, correlation IDs
- ✅ **State Management**: Focused React contexts (Auth, UI, Stats, Chat, Error, Notifications)
- ✅ **Error Handling**: Comprehensive system with error boundaries, Persian user messages
- ✅ **Security**: Secret scanning, JWT rotation, webhook verification, XSS protection
- ✅ **Monitoring**: Structured logging (Winston), health checks, metrics, alerting system
- ✅ **Testing**: Integration tests (Jest), unit tests (Vitest), E2E tests (Puppeteer)
- ✅ **CI/CD**: Multi-stage GitHub Actions pipeline with PostgreSQL integration
- ✅ **Mobile Optimization**: Responsive design, PWA support, cross-device testing (90% pass rate)
- ✅ **Performance**: Code splitting, lazy loading, bundle optimization (83% performance score)

### Production Readiness
- ✅ **Scalability**: Stateless architecture, Redis session store, horizontal scaling plan
- ✅ **Observability**: Correlation ID tracking, log aggregation (ELK/Loki/CloudWatch)
- ✅ **Security Hardening**: Secret rotation, dependency scanning, branch protection
- ✅ **Documentation**: Comprehensive API docs, deployment guides, architecture documentation

---

## ❌ What is NOT Implemented

### Planned Features (Not in MVP)
- ❌ **Real-time Video Streaming**: Course videos currently use external links
- ❌ **Live Sessions**: Video conferencing integration not yet implemented
- ❌ **Multi-language Support**: UI currently Persian-only (internationalization planned)
- ❌ **Advanced Analytics**: Business intelligence dashboard, detailed user analytics
- ❌ **Mobile Apps**: Native iOS/Android apps (responsive web only)
- ❌ **Email Notifications**: Transactional emails (SendGrid/AWS SES integration planned)
- ❌ **Social Features**: Forums, peer reviews, student discussions
- ❌ **Content CDN**: Static asset delivery via CDN (currently served from origin)
- ❌ **Multi-currency**: Only supports single currency currently (roadmap item)

### Known Limitations
- **Single Database Instance**: No read replicas or sharding (see [Architecture Limitations](docs/ARCHITECTURE_LIMITATIONS.md))
- **Manual Deployment**: No automated blue-green deployment (manual process documented)
- **Basic Search**: Full-text search uses PostgreSQL `LIKE` (Elasticsearch planned)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: >= 18.x
- **PostgreSQL**: >= 15.x
- **npm/pnpm**: Latest stable version

### Local Development

#### 1. Start PostgreSQL (Docker)
```bash
docker run --name tondino-postgres \
  -e POSTGRES_USER=aidin \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=tondino \
  -p 5432:5432 -d postgres:15
```

**Verify PostgreSQL is running:**
```bash
psql postgres://aidin:pass@localhost:5432/tondino -c "SELECT version();"
```

#### 2. Backend Setup
```bash
cd tondino-backend

# Install dependencies
npm install

# Configure environment
# The .env file is already present but needs values populated
# Edit tondino-backend/.env with your credentials:
# - DATABASE_URL=postgres://aidin:pass@localhost:5432/tondino
# - JWT_SECRET=development_jwt_secret_change_in_production_12345678
# - ADMIN_EMAIL=admin@tondino.local
# - ADMIN_PASSWORD=DevAdmin2026!

# Run migrations (creates tables and seeds data)
npm run migrate:up

# Start development server
npx ts-node-dev --respawn src/server.ts  # Runs on http://localhost:3001
```

#### 3. Frontend Setup
```bash
cd tondino-frontend

# Install dependencies
npm install

# Start development server
npm run dev  # Runs on http://localhost:5173
```

#### 4. Verify Installation
- **Frontend**: http://localhost:5173
- **Backend Health**: http://localhost:3001/api/health
- **Backend Metrics**: http://localhost:3001/api/metrics
- **API Docs**: See [API.md](tondino-backend/docs/API.md)

**Test the system:**
```bash
# Backend health check
curl http://localhost:3001/api/health

# Expected output: {"status":"OK","timestamp":"...","uptime":...}

# Run secret scanner
./scripts/scan-secrets.sh  # Should pass with no errors

# Run tests
cd tondino-backend && npm test
cd tondino-frontend && npm test
```

### Build for Production
```bash
# Build both projects
npm run build:all

# Or individually
cd tondino-backend && npm run build
cd tondino-frontend && npm run build
```

---

## 🔐 Environment Variables

### Backend (`tondino-backend/.env`)

#### Required
```bash
DATABASE_URL=postgres://user:password@localhost:5432/tondino
JWT_SECRET=your_strong_jwt_secret_min_32_chars
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
```

#### Optional (with defaults)
```bash
PORT=3001
FRONTEND_URL=http://localhost:5173,http://localhost:3000

# Payment (Stripe)
STRIPE_SECRET_KEY=sk_test_xxx  # Required for payments
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Required for webhooks

# Monitoring
ALERT_WEBHOOK_URL=https://hooks.slack.com/xxx  # Alert notifications
ELASTICSEARCH_URL=http://localhost:9200  # Log aggregation
LOKI_URL=http://localhost:3100  # Alternative log aggregation
CLOUDWATCH_REGION=us-east-1  # AWS CloudWatch logging

# Session Store (Redis for horizontal scaling)
REDIS_URL=redis://localhost:6379
```

#### Security Notes
- **NEVER commit `.env` files** — they are gitignored
- Use `.env.example` as a template
- Rotate all secrets before production deployment
- Run `npm run scan:secrets` before each commit

### Frontend (`tondino-frontend/.env`)
```bash
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # For payment UI
```

---

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────┐      HTTP/REST       ┌─────────────┐
│   Frontend  │ ←─────────────────→  │   Backend   │
│ React + TS  │                      │ Express + TS│
└─────────────┘                      └──────┬──────┘
                                            │
                                            │ SQL
                                            ↓
                                     ┌─────────────┐
                                     │  PostgreSQL │
                                     └─────────────┘
```

### Backend Components
- **API Layer**: Express routes with JWT middleware
- **Service Layer**: Business logic (auth, courses, payment, chat)
- **Data Layer**: PostgreSQL connection pool
- **Monitoring**: Winston logging + metrics middleware
- **Payment**: Stripe integration with webhook verification

### Frontend Components
- **UI Layer**: React components with Tailwind CSS
- **State Management**: Focused contexts (Auth, UI, Chat, Stats, Error)
- **API Client**: Typed services with error handling
- **Routing**: React Router with lazy loading

### Database Schema
See [schema.sql](tondino-backend/schema.sql) for complete schema.

**Key Tables:**
- `users` — User accounts with authentication
- `courses` — Course catalog
- `user_courses` — Enrollment and progress
- `user_stats` — Learning analytics
- `chat_sessions`, `chat_messages` — Multi-session chat
- `payment_intents` — Stripe payment tracking
- `pgmigrations` — Migration versioning

---

## 📊 Build & Test Reports

### Automated Testing
```bash
# Generate comprehensive test report
npm run test:report  # Creates test-reports/latest.md

# Run individual test suites
cd tondino-backend && npm test       # Backend integration tests
cd tondino-frontend && npm test      # Frontend unit tests
npm run test:e2e                     # Puppeteer E2E tests
```

### Latest Test Results
- **Location**: [test-reports/latest.md](test-reports/latest.md)
- **Generated**: Automatically on each test run
- **Includes**: Build status, TypeScript checks, unit tests, integration tests

### Performance Testing
```bash
npm run test:performance          # Full performance suite
npm run test:quick-performance    # Quick performance check
```

### Security Scanning
```bash
npm run scan:secrets              # Check for exposed secrets
npm run test:security-review      # Comprehensive security audit
```

### CI/CD Pipeline
- **Workflow**: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml)
- **Stages**: Lint → Backend Tests → Frontend Tests → E2E Tests → Report
- **Database**: PostgreSQL container for integration tests
- **Artifacts**: Test reports, coverage, build logs
- **Branch Protection**: Required checks, no merge on failure

---

## 🚢 Deployment

### Production Deployment Checklist
See complete guide: [docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md](docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)

#### Pre-Deployment
- [ ] Rotate all secrets (JWT, admin password, Stripe keys)
- [ ] Run security scan: `npm run scan:secrets`
- [ ] Run full test suite: `npm run test:report`
- [ ] Build production bundles: `npm run build:all`
- [ ] Verify environment variables on production server

#### Database Migration
```bash
# IMPORTANT: Backup database first!
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Run migrations
cd tondino-backend
NODE_ENV=production npm run migrate:up
```

#### Server Deployment
```bash
# Backend (example with PM2)
cd tondino-backend
pm2 start ecosystem.config.js --env production

# Frontend (serve static build)
cd tondino-frontend/dist
# Serve with nginx, Apache, or CDN
```

#### Post-Deployment Verification
- [ ] Health check: `curl https://api.example.com/api/health/full`
- [ ] Metrics endpoint: `curl https://api.example.com/api/metrics`
- [ ] Test user login flow
- [ ] Verify payment webhook endpoint
- [ ] Check logs for errors: `pm2 logs tondino-backend`

### Horizontal Scaling
See detailed plan: [docs/HORIZONTAL_SCALING_PLAN.md](docs/HORIZONTAL_SCALING_PLAN.md)

**Key Points:**
- Stateless app instances (JWT tokens, Redis sessions)
- Kubernetes deployment configs included
- Load balancer configuration examples
- Database connection pooling configured

---

## 🔒 Security

### Security Measures
- ✅ **Secret Scanning**: Automated scanning in CI/CD
- ✅ **Dependency Scanning**: `npm audit` in pipeline
- ✅ **CORS Protection**: Configured allowed origins
- ✅ **XSS Protection**: Content Security Policy headers
- ✅ **SQL Injection**: Parameterized queries only
- ✅ **JWT Security**: Short expiration, secure signing
- ✅ **Webhook Verification**: Stripe signature validation
- ✅ **Rate Limiting**: Configured on sensitive endpoints
- ✅ **Audit Logging**: All sensitive operations logged

### Security Checklist
See: [tondino-backend/SECURITY.md](tondino-backend/SECURITY.md)

### Reporting Vulnerabilities
Email: security@example.com (replace with actual contact)

---

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following project patterns
3. Run tests: `npm run test:report`
4. Run secret scan: `npm run scan:secrets`
5. Commit with conventional commits: `feat:`, `fix:`, `docs:`
6. Push and create pull request
7. Ensure CI passes before requesting review

### Code Standards
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint + Prettier configured
- **Testing**: Required for new features
- **Documentation**: Update relevant docs

### Branch Protection
See setup guide: [docs/BRANCH_PROTECTION.md](docs/BRANCH_PROTECTION.md)

---

## 📚 Documentation

### Project Documentation
- [Architecture Limitations](docs/ARCHITECTURE_LIMITATIONS.md) — Current system constraints
- [Horizontal Scaling Plan](docs/HORIZONTAL_SCALING_PLAN.md) — Multi-instance deployment
- [Production Deployment Checklist](docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md) — Go-live guide
- [Migration Guide](docs/MIGRATIONS.md) — Database schema management
- [Compliance Implementation](docs/COMPLIANCE_IMPLEMENTATION.md) — Project rules adherence

### Backend Documentation
- [API Reference](tondino-backend/docs/API.md) — REST endpoint documentation
- [Payment Integration](tondino-backend/docs/PAYMENT_INTEGRATION.md) — Stripe setup guide
- [Log Aggregation](tondino-backend/docs/LOG_AGGREGATION.md) — ELK/Loki integration

### Task Completion Reports
- [Task 6: Testing & CI/CD](docs/TASK_6_COMPLETION.md)
- [Task 8: Monitoring & Observability](docs/TASK_8_COMPLETION.md)
- [Task 9: Production Readiness](docs/TASK_9_COMPLETION.md)
- [Task 10: Payment Integration](docs/TASK_10_COMPLETION.md)

### AI Agent Instructions
- [Copilot Instructions](.github/copilot-instructions.md) — AI coding agent guide

---

## 📝 License

Proprietary — All rights reserved

---

## 🙏 Acknowledgments

Built with:
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Express, Node.js, PostgreSQL
- **Payment**: Stripe
- **Monitoring**: Winston, Prometheus (planned)
- **Testing**: Jest, Vitest, Puppeteer
- **CI/CD**: GitHub Actions

---

**Replace `<OWNER>/<REPO>` in badge URLs with your GitHub repository details.**
