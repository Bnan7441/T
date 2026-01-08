import express, { Request, Response } from "express";
import pool from "../config/database";
import authMiddleware from "../middleware/auth";
import { log } from "../utils/logger";

const router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cat.name as category_name, cat.icon as category_icon, cat.color as category_color
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.is_active = true
       ORDER BY c.created_at DESC`
    );
    res.json({ courses: result.rows });
  } catch (error) {
    log.error("Get public courses error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/my-courses", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT c.course_id, c.title, c.description, uc.purchased_at
       FROM user_courses uc
       JOIN courses c ON uc.course_id = c.id
       WHERE uc.user_id = $1
       ORDER BY uc.purchased_at DESC`,
      [(req as any).userId]
    );

    res.json({ courses: result.rows });
  } catch (error) {
    log.error("Get my courses error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/access/:courseId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const courseResult = await pool.query("SELECT id, is_free FROM courses WHERE course_id = $1 AND is_active = true", [courseId]);
    if (courseResult.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    const course = courseResult.rows[0];
    if (course.is_free) return res.json({ hasAccess: true, reason: "free" });
    const purchaseResult = await pool.query("SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2", [(req as any).userId, course.id]);
    if (purchaseResult.rows.length > 0) return res.json({ hasAccess: true, reason: "purchased" });
    res.json({ hasAccess: false });
  } catch (error) {
    log.error("Check access error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/purchase/:courseId", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const courseResult = await pool.query(
      "SELECT id, title, price, is_free FROM courses WHERE course_id = $1 AND is_active = true",
      [courseId]
    );
    if (courseResult.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    const course = courseResult.rows[0];
    const existingPurchase = await pool.query("SELECT id FROM user_courses WHERE user_id = $1 AND course_id = $2", [(req as any).userId, course.id]);
    if (existingPurchase.rows.length > 0) return res.status(400).json({ error: "Course already purchased" });

    // Ensure numeric payment amount (DB DECIMAL may be returned as string)
    const paymentAmount = typeof course.price === "string" ? parseFloat(course.price) : Number(course.price || 0);
    if (isNaN(paymentAmount) || paymentAmount < 0) {
      log.warn("Invalid course price", { courseId, price: course.price }, req);
      return res.status(500).json({ error: "Invalid course pricing configuration" });
    }

    const isFree = Boolean(course.is_free) || paymentAmount === 0;
    if (!isFree) {
      return res.status(400).json({
        error: "Payment required",
        message: "Please use payment gateway for paid courses",
        hint: "Create payment intent via POST /api/payment/create-intent",
      });
    }

    const insertResult = await pool.query(
      "INSERT INTO user_courses (user_id, course_id, payment_amount, payment_status) VALUES ($1, $2, $3, $4) RETURNING id, purchased_at",
      [(req as any).userId, course.id, 0, "completed"]
    );

    log.info(
      "Course enrolled successfully",
      { userId: (req as any).userId, courseId, paymentAmount: 0 },
      req
    );

    res.json({
      message: "Course enrolled successfully",
      course: { id: courseId, title: course.title },
      purchase: insertResult.rows[0],
    });
  } catch (error) {
    log.error("Purchase error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stats", authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM user_stats WHERE user_id = $1", [(req as any).userId]);
    if (result.rows.length === 0) {
      await pool.query("INSERT INTO user_stats (user_id) VALUES ($1)", [(req as any).userId]);
      return res.json({ stats: { top_speed: 0, points: 0, reading_minutes: 0, courses_completed: 0, current_streak: 0 } });
    }
    res.json({ stats: result.rows[0] });
  } catch (error) {
    log.error("Get stats error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/stats", authMiddleware, async (req: Request, res: Response) => {
  try {
    const { top_speed, points, reading_minutes, courses_completed, current_streak } = req.body as any;
    const result = await pool.query(
      `UPDATE user_stats
       SET top_speed = COALESCE($1, top_speed),
           points = COALESCE($2, points),
           reading_minutes = COALESCE($3, reading_minutes),
           courses_completed = COALESCE($4, courses_completed),
           current_streak = COALESCE($5, current_streak),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $6
       RETURNING *`,
      [top_speed, points, reading_minutes, courses_completed, current_streak, (req as any).userId]
    );
    res.json({ stats: result.rows[0] });
  } catch (error) {
    log.error("Update stats error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT c.*, 
              cat.name as category_name,
              cat.icon as category_icon, 
              cat.color as category_color,
              json_agg(
                json_build_object(
                  'id', l.id,
                  'title', l.title,
                  'description', l.description,
                  'content', l.content,
                  'video_url', l.video_url,
                  'duration', l.duration || 'minutes',
                  'is_free', l.is_free,
                  'order_index', l.order_index
                ) ORDER BY l.order_index
              ) FILTER (WHERE l.id IS NOT NULL) as syllabus
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       LEFT JOIN lessons l ON c.id = l.course_id
       WHERE (c.id::text = $1 OR c.course_id = $1) AND c.is_active = true
       GROUP BY c.id, cat.name, cat.icon, cat.color`,
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    const course: any = result.rows[0];
    course.id = course.course_id || id;
    course.instructor = 'Course Instructor';
    course.rating = 4.8;
    course.image = course.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop';
    course.category = course.category_name || 'General';
    course.price = course.is_free ? 'Free' : `${parseFloat(course.price).toLocaleString('fa-IR')} Toman`;

    res.json({ course });
  } catch (error) {
    log.error("Get course with lessons error", { error }, req);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
