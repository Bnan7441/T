-- Migration 003: Seed user_stats for users missing them
-- Inserts a default user_stats row for every user that does not have one.

INSERT INTO user_stats (user_id, top_speed, points, reading_minutes, courses_completed, current_streak, updated_at)
SELECT u.id, 0, 0, 0, 0, 0, CURRENT_TIMESTAMP
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM user_stats s WHERE s.user_id = u.id);
