-- Down migration for 001_initial: drop tables in reverse order
-- WARNING: This will remove all data created by the initial migration.

-- Drop seed data inserts are not necessary; dropping tables will remove seeded rows.

-- Safety guard: abort unless a marker row is present in public.pgmigrations.
-- This prevents accidental execution of a destructive down migration.
DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM public.pgmigrations WHERE name = 'ALLOW_DROP_ALL') THEN
		RAISE EXCEPTION 'Protected down migration: to run this down migration, insert a row into public.pgmigrations with name = ''ALLOW_DROP_ALL'' and a recent run_on timestamp, then re-run. Aborting.';
	END IF;
END;
$$;

DROP INDEX IF EXISTS idx_sessions_expires_at;
DROP INDEX IF EXISTS idx_sessions_user_id;
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_articles_published;
DROP INDEX IF EXISTS idx_user_stats_user_id;
DROP INDEX IF EXISTS idx_user_courses_user_id;
DROP INDEX IF EXISTS idx_lessons_course_id;
DROP INDEX IF EXISTS idx_courses_category_id;
DROP INDEX IF EXISTS idx_users_email;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS user_stats;
DROP TABLE IF EXISTS user_courses;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
