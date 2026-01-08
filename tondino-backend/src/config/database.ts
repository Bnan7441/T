import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

// Prefer DATABASE_URL if provided (used by migrations and docker/dev),
// otherwise fall back to individual DB_* environment variables.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

pool.on("error", (err: Error) => {
  console.error("Unexpected database error:", err);
});

export default pool;
