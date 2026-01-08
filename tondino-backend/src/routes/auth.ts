import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pool from "../config/database";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().notEmpty(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, phone } = req.body as any;

      const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: "Email already registered" });
      }

      const password_hash = await bcrypt.hash(password, 12);

      const result = await pool.query(
        "INSERT INTO users (email, password_hash, name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, name",
        [email, password_hash, name, phone || null]
      );

      const user = result.rows[0];

      await pool.query("INSERT INTO user_stats (user_id) VALUES ($1)", [user.id]);

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

      // Set httpOnly cookie for secure token storage
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      res.status(201).json({ 
        message: "User registered successfully", 
        user: { id: user.id, email: user.email, name: user.name } 
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Server error during registration" });
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body as any;

      const result = await pool.query(
        "SELECT id, email, name, password_hash, is_active, avatar FROM users WHERE email = $1",
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: "Account is deactivated" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

      // Set httpOnly cookie for secure token storage
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      res.json({ 
        message: "Login successful", 
        user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Server error during login" });
    }
  }
);

router.get("/me", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, email, name, phone, avatar, join_date, is_admin FROM users WHERE id = $1", [(req as any).userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/google", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body as any;
    const googleApiUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`;
    const response = await fetch(googleApiUrl);
    const googleUser = await response.json();

    if (!googleUser.email || !googleUser.email_verified) {
      return res.status(400).json({ error: "Invalid Google account" });
    }

    let user = await pool.query("SELECT id, email, name, is_active, is_admin, avatar FROM users WHERE email = $1", [googleUser.email]);
    if (user.rows.length === 0) {
      const randomPassword = require("crypto").randomBytes(32).toString("hex");
      const password_hash = await bcrypt.hash(randomPassword, 12);
      user = await pool.query(
        "INSERT INTO users (email, password_hash, name, avatar) VALUES ($1, $2, $3, $4) RETURNING id, email, name, avatar",
        [googleUser.email, password_hash, googleUser.name, googleUser.picture]
      );
    }

    const userData = user.rows[0];
    if (!userData.is_active) return res.status(403).json({ error: "Account is deactivated" });

    const token = jwt.sign({ userId: userData.id, email: userData.email }, process.env.JWT_SECRET as string, { expiresIn: "30d" });

    // Set httpOnly cookie for secure token storage
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: '/',
    });

    res.json({ 
      message: "Google login successful", 
      user: { id: userData.id, email: userData.email, name: userData.name, avatar: userData.avatar || googleUser.picture } 
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ error: "Server error during Google authentication" });
  }
});

// Status endpoint - returns 200 OK even if not authenticated (avoids 401 console errors)
router.get("/status", async (req: Request, res: Response) => {
  try {
    let token = req.cookies?.auth_token;
    if (!token) {
      const authHeader = req.headers.authorization as string | undefined;
      token = authHeader?.replace("Bearer ", "");
    }
    
    if (!token) {
      return res.json({ isAuthenticated: false });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    
    const result = await pool.query("SELECT id, email, name, phone, avatar, join_date, is_admin FROM users WHERE id = $1", [decoded.userId]);
    
    if (result.rows.length === 0) {
       return res.json({ isAuthenticated: false });
    }

    res.json({ isAuthenticated: true, user: result.rows[0] });

  } catch (error) {
     return res.json({ isAuthenticated: false });
  }
});

router.get("/profile", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT id, email, name, phone, avatar, join_date, is_admin FROM users WHERE id = $1", [(req as any).userId]);
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/profile", authMiddleware, [
  body("name").optional().trim().notEmpty(),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone } = req.body as any;
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (email !== undefined) {
      const emailCheck = await pool.query("SELECT id FROM users WHERE email = $1 AND id != $2", [email, (req as any).userId]);
      if (emailCheck.rows.length > 0) return res.status(400).json({ error: "Email already in use" });
      updates.push(`email = $${paramCount++}`); values.push(email);
    }
    if (phone !== undefined) { updates.push(`phone = $${paramCount++}`); values.push(phone); }

    if (updates.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push((req as any).userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING id, email, name, phone, avatar, is_admin`,
      values
    );

    res.json({ message: "Profile updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout endpoint - clear httpOnly cookie
router.post("/logout", (req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  res.json({ message: "Logged out successfully" });
});

export default router;
