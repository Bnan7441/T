-- Down migration for 003_seed_user_stats: remove seeded default user_stats rows
-- Safer rollback: only delete rows that were likely inserted by the
-- '003_seed_user_stats' migration by matching default values AND their
-- `updated_at` being on-or-after the migration run timestamp recorded in
-- `public.pgmigrations`. This reduces risk of deleting legitimate rows
-- that may legitimately have all-zero values.

DELETE FROM user_stats
WHERE top_speed = 0
  AND points = 0
  AND reading_minutes = 0
  AND courses_completed = 0
  AND current_streak = 0
  AND updated_at >= (
    SELECT run_on - INTERVAL '5 seconds' FROM public.pgmigrations
    WHERE name = '003_seed_user_stats'
  );
