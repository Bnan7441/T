import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./routes/auth";
import courseRoutes from "./routes/courses";
import adminRoutes from "./routes/admin";
import chatRoutes from "./routes/chat";
import paymentRoutes from "./routes/payment";
import pool from "./config/database";
import bcrypt from "bcrypt";
import { errorHandler, NotFoundError } from "./utils/errorHandler";
import { log, correlationMiddleware, metrics } from "./utils/logger";
import { requestLogger, responseTimeMiddleware } from "./middleware/logging";
import { metricsMiddleware, getApplicationMetrics, getTopSlowEndpoints, getTopErrorEndpoints } from "./middleware/metrics";
import { 
  simpleHealthCheck, 
  fullHealthCheck, 
  databaseHealthCheck, 
  readinessCheck, 
  livenessCheck 
} from "./utils/healthChecks";
import alertManager from "./utils/alerting";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.set("trust proxy", 1);

// Add correlation ID middleware first
app.use(correlationMiddleware);

// Add response time measurement
app.use(responseTimeMiddleware);

// Add request logging
app.use(requestLogger);

// Add application metrics tracking
app.use(metricsMiddleware);

app.use(helmet());

// CORS must come before other middleware that might set headers
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc)
    if (!origin) {
      return callback(null, true);
    }
    // Check if origin is in allowed list
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false); // Don't throw, just reject silently
    }
  },
  credentials: true,
}));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: "Too many requests from this IP, please try again later." });
app.use("/api/", limiter);

// IMPORTANT: Payment webhook needs raw body for signature verification
// Register webhook route BEFORE express.json() middleware
app.use("/api/payment/webhook", paymentRoutes);

app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
// Payment routes (excluding webhook which is registered above)
app.use("/api/payment", paymentRoutes);

async function ensureAdminUser() {
  try {
    // Runtime schema creation removed. Use the SQL schema in `/tondino-backend/schema.sql`
    // and a proper migration system. If the `users` table does not exist the
    // following queries will fail — this will be caught and a helpful message
    // will be logged for operators.
    const adminCount = await pool.query("SELECT COUNT(*) as total FROM users WHERE is_admin = true");
    if (parseInt(adminCount.rows[0].total) === 0) {
      const email = process.env.ADMIN_EMAIL;
      const password = process.env.ADMIN_PASSWORD;
      const name = process.env.ADMIN_NAME || "Admin";
      if (email && password) {
        const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        const password_hash = await bcrypt.hash(password, 12);
        if (existing.rows.length > 0) {
          await pool.query("UPDATE users SET password_hash = $1, is_admin = true, is_active = true, name = $2 WHERE id = $3", [password_hash, name, existing.rows[0].id]);
        } else {
          await pool.query("INSERT INTO users (email, password_hash, name, is_admin, is_active) VALUES ($1, $2, $3, true, true)", [email, password_hash, name]);
        }
        log.audit('admin_user_ensured', email, { 
          action: existing.rows.length > 0 ? 'updated' : 'created' 
        });
        log.info("Admin user ensured", { email });
      } else {
        log.warn("No ADMIN_EMAIL/ADMIN_PASSWORD provided; cannot bootstrap admin user");
        // Boot-time check for critical environment variables.
        function checkCriticalEnv() {
          const required = ["JWT_SECRET"];
          // DATABASE_URL or DB_* may be used; only require DB in production if not set.
          if (process.env.NODE_ENV === "production") {
            const missing = required.filter((k) => !process.env[k]);
            if (missing.length > 0) {
              log.error("Missing required environment variables", { 
                missing, 
                action: "aborting_startup_in_production" 
              });
              process.exit(1);
            }
          } else {
            const missing = required.filter((k) => !process.env[k]);
            if (missing.length > 0) {
              log.warn("Missing environment variables", { 
                missing, 
                environment: "non_production" 
              });
            }
          }
        }

        checkCriticalEnv();
      }
    }
  } catch (e: any) {
    // Likely cause: DB schema not applied. Log actionable instruction.
    log.error("ensureAdminUser error", { 
      error: e?.message || e,
      hint: "Database schema may not be applied. Run migrations or apply schema.sql"
    });
  }
}

// Health check endpoints
app.get("/api/health", simpleHealthCheck);
app.get("/api/health/full", fullHealthCheck);
app.get("/api/health/database", databaseHealthCheck);
app.get("/api/health/ready", readinessCheck);  // Kubernetes readiness probe
app.get("/api/health/live", livenessCheck);    // Kubernetes liveness probe

// Enhanced metrics endpoint  
app.get("/api/metrics", (req: Request, res: Response) => {
  const metricsData = {
    basic: metrics.getSnapshot(),
    application: getApplicationMetrics(),
    performance: {
      topSlowEndpoints: getTopSlowEndpoints(),
      topErrorEndpoints: getTopErrorEndpoints()
    },
    system: {
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  };
  
  log.info("Metrics requested", { 
    totalRequests: metricsData.application.totalRequests,
    errorRate: metricsData.application.errorCount / metricsData.application.totalRequests || 0
  }, req);
  res.json(metricsData);
});

// Alert status endpoint
app.get("/api/alerts", (req: Request, res: Response) => {
  const alertStatus = alertManager.getAlertStatus();
  log.debug("Alert status requested", alertStatus, req);
  res.json(alertStatus);
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.path} not found`));
});

// Use standardized error handler
app.use(errorHandler);

if (require.main === module) {
  // Only attempt to ensure admin user when running the server directly
  ensureAdminUser();

  app.listen(PORT, () => {
    log.info("Tondino backend API started", { 
      port: PORT,
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      pid: process.pid
    });
    
    // Start alert monitoring
    alertManager.startMonitoring();
  });
}

process.on("SIGTERM", () => {
  log.info("SIGTERM received, shutting down gracefully");
  alertManager.stopMonitoring();
  process.exit(0);
});

process.on("SIGINT", () => {
  log.info("SIGINT received, shutting down gracefully");
  alertManager.stopMonitoring();
  process.exit(0);
});

export default app;
