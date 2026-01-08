import { Router, Request, Response } from 'express';
import pool from '../config/database';
import authMiddleware from '../middleware/auth';

const router = Router();

// Get user's chat sessions
router.get('/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, session_title, created_at, updated_at 
       FROM chat_sessions 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [(req as any).userId]
    );
    res.json({ sessions: result.rows });
  } catch (error) {
    console.error('Get chat sessions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new chat session
router.post('/sessions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { title } = req.body;
    const result = await pool.query(
      `INSERT INTO chat_sessions (user_id, session_title) 
       VALUES ($1, $2) RETURNING *`,
      [(req as any).userId, title || 'New Chat']
    );
    res.status(201).json({ session: result.rows[0] });
  } catch (error) {
    console.error('Create chat session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a specific session
router.get('/sessions/:sessionId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, (req as any).userId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    const result = await pool.query(
      `SELECT id, role, content, created_at 
       FROM chat_messages 
       WHERE session_id = $1 
       ORDER BY created_at ASC`,
      [sessionId]
    );
    
    res.json({ messages: result.rows });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add message to session
router.post('/sessions/:sessionId/messages', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;
    
    if (!['user', 'model'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "model"' });
    }
    
    // Verify session belongs to user
    const sessionCheck = await pool.query(
      'SELECT id FROM chat_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, (req as any).userId]
    );
    
    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    // Add message
    const messageResult = await pool.query(
      `INSERT INTO chat_messages (session_id, role, content) 
       VALUES ($1, $2, $3) RETURNING *`,
      [sessionId, role, content]
    );
    
    // Update session timestamp
    await pool.query(
      'UPDATE chat_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [sessionId]
    );
    
    res.status(201).json({ message: messageResult.rows[0] });
  } catch (error) {
    console.error('Add chat message error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const result = await pool.query(
      'DELETE FROM chat_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
      [sessionId, (req as any).userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or access denied' });
    }
    
    res.json({ success: true, message: 'Chat session deleted' });
  } catch (error) {
    console.error('Delete chat session error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;