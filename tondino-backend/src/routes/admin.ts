import express, { Request, Response } from "express";
import pool from "../config/database";
import authMiddleware from "../middleware/auth";
import adminMiddleware from "../middleware/admin";
import upload from "../middleware/upload";

const router = express.Router();

// ============== USERS ENDPOINTS ==============
router.get("/users", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.is_active,
        u.is_admin,
        u.join_date,
        COALESCE(us.points, 0)::int AS points,
        COALESCE(us.top_speed, 0)::int AS top_speed,
        COALESCE(uc.courses_count, 0)::int AS courses_count
      FROM users u
      LEFT JOIN user_stats us ON us.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS courses_count
        FROM user_courses
        GROUP BY user_id
      ) uc ON uc.user_id = u.id
      ORDER BY u.id DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Admin get users error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/users/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        u.id,
        u.email,
        u.name,
        u.phone,
        u.avatar,
        u.is_active,
        u.is_admin,
        u.join_date,
        COALESCE(us.points, 0)::int AS points,
        COALESCE(us.top_speed, 0)::int AS top_speed,
        COALESCE(uc.courses_count, 0)::int AS courses_count
      FROM users u
      LEFT JOIN user_stats us ON us.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*)::int AS courses_count
        FROM user_courses
        GROUP BY user_id
      ) uc ON uc.user_id = u.id
      WHERE u.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Admin get user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/users/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, is_active, is_admin } = req.body;
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), is_active = COALESCE($3, is_active), is_admin = COALESCE($4, is_admin) WHERE id = $5 RETURNING id, email, name, is_active, is_admin",
      [name, email, is_active, is_admin, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Admin update user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error("Admin delete user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============== CATEGORIES ENDPOINTS ==============
router.get("/categories", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ categories: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/categories", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, icon, color } = req.body;
    const result = await pool.query("INSERT INTO categories (name, icon, color) VALUES ($1, $2, $3) RETURNING *", [name, icon, color]);
    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/categories/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const result = await pool.query("UPDATE categories SET name = COALESCE($1, name), icon = COALESCE($2, icon), color = COALESCE($3, color) WHERE id = $4 RETURNING *", [name, icon, color, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Category not found" });
    res.json({ category: result.rows[0] });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/categories/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============== COURSES ENDPOINTS ==============
router.get("/courses", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const categoryIdRaw = req.query.category_id as string | undefined;
    const categoryId = categoryIdRaw ? parseInt(categoryIdRaw, 10) : null;

    const params: any[] = [];
    let whereClause = "";
    if (categoryIdRaw && Number.isFinite(categoryId)) {
      params.push(categoryId);
      whereClause = `WHERE c.category_id = $${params.length}`;
    }

    const result = await pool.query(
      `SELECT
        c.*,
        cat.name as category_name,
        cat.icon as category_icon,
        cat.color as category_color
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       ${whereClause}
       ORDER BY c.created_at DESC`,
      params
    );
    res.json({ courses: result.rows });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/courses/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        c.*,
        cat.name as category_name,
        cat.icon as category_icon,
        cat.color as category_color
       FROM courses c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error("Get course error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/courses", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { course_id, title, description, price, is_free, category_id, image_url, instructor, rating, age_group } = req.body;
    const result = await pool.query(
      `INSERT INTO courses (course_id, title, description, price, is_free, category_id, image_url, instructor, rating, age_group)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [course_id, title, description, price, is_free, category_id, image_url, instructor, rating, age_group]
    );
    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error("Create course error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/courses/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, is_free, category_id, image_url, instructor, rating, age_group, is_active } = req.body;
    const result = await pool.query(
      `UPDATE courses
       SET title = COALESCE($1, title), description = COALESCE($2, description), price = COALESCE($3, price),
           is_free = COALESCE($4, is_free), category_id = COALESCE($5, category_id), image_url = COALESCE($6, image_url),
           instructor = COALESCE($7, instructor), rating = COALESCE($8, rating), age_group = COALESCE($9, age_group),
           is_active = COALESCE($10, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title, description, price, is_free, category_id, image_url, instructor, rating, age_group, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Course not found" });
    res.json({ course: result.rows[0] });
  } catch (error) {
    console.error("Update course error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/courses/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM courses WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============== LESSONS ENDPOINTS ==============
router.get("/courses/:courseId/lessons", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const result = await pool.query("SELECT * FROM lessons WHERE course_id = $1 ORDER BY order_index ASC", [courseId]);
    res.json({ lessons: result.rows });
  } catch (error) {
    console.error("Get lessons error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/courses/:courseId/lessons", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, content, video_url, duration, is_free, order_index } = req.body;
    const result = await pool.query(
      `INSERT INTO lessons (course_id, title, description, content, video_url, duration, is_free, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [courseId, title, description, content, video_url, duration, is_free, order_index || 0]
    );
    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error("Create lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/lessons/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM lessons WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Lesson not found" });
    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error("Get lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/lessons/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, content, video_url, duration, is_free, order_index } = req.body;
    const result = await pool.query(
      `UPDATE lessons
       SET title = COALESCE($1, title), description = COALESCE($2, description), content = COALESCE($3, content),
           video_url = COALESCE($4, video_url), duration = COALESCE($5, duration), is_free = COALESCE($6, is_free),
           order_index = COALESCE($7, order_index), updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [title, description, content, video_url, duration, is_free, order_index, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Lesson not found" });
    res.json({ lesson: result.rows[0] });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/lessons/:id", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM lessons WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/courses/:courseId/lessons/reorder", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonIds } = req.body;

    for (let i = 0; i < lessonIds.length; i++) {
      await pool.query("UPDATE lessons SET order_index = $1 WHERE id = $2", [i, lessonIds[i]]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Reorder lessons error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// ============== STATS ENDPOINTS ==============
router.get("/stats", authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const usersResult = await pool.query("SELECT COUNT(*) as total FROM users");
    const coursesResult = await pool.query("SELECT COUNT(*) as total FROM courses WHERE is_active = true");
    const purchasesResult = await pool.query("SELECT COUNT(*) as total FROM user_courses");
    const revenueResult = await pool.query(`SELECT COALESCE(SUM(c.price), 0) as total FROM user_courses uc JOIN courses c ON uc.course_id = c.id`);

    res.json({
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total),
        totalCourses: parseInt(coursesResult.rows[0].total),
        totalPurchases: parseInt(purchasesResult.rows[0].total),
        totalRevenue: parseInt(revenueResult.rows[0].total)
      }
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/upload-image", authMiddleware, adminMiddleware, upload.single("image"), async (req: Request, res: Response) => {
  try {
    const file: any = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const imagePath = `/uploads/courses/${file.filename}`;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}${imagePath}`;
    res.json({ imageUrl, imagePath });
  } catch (error) {
    console.error("Upload image error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
