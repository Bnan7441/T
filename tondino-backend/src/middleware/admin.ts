import { Request, Response, NextFunction } from "express";
import pool from "../config/database";

const adminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!(req as any).userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const result = await pool.query(
      "SELECT is_admin FROM users WHERE id = $1",
      [(req as any).userId]
    );

    if (result.rows.length === 0 || !result.rows[0].is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export default adminMiddleware;
