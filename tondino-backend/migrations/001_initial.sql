-- Initial migration generated from /tondino-backend/schema.sql
-- Apply the full schema and seed data

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar TEXT,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    color VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (expanded with missing fields)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    is_free BOOLEAN DEFAULT false,
    category_id INTEGER REFERENCES categories(id),
    image_url TEXT,
    instructor VARCHAR(255) DEFAULT 'مدرس دوره',
    rating DECIMAL(3, 1) DEFAULT 4.8,
    age_group VARCHAR(20) DEFAULT 'adult',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration VARCHAR(50),
    is_free BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User course purchases
CREATE TABLE IF NOT EXISTS user_courses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_amount DECIMAL(10, 2),
    payment_status VARCHAR(50) DEFAULT 'completed',
    UNIQUE(user_id, course_id)
);

-- User stats
CREATE TABLE IF NOT EXISTS user_stats (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    top_speed INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    reading_minutes INTEGER DEFAULT 0,
    courses_completed INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session tokens (for logout/token invalidation)
CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table (for blog)
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    author_id INTEGER REFERENCES users(id),
    image_url TEXT,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_courses_category_id ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_user_courses_user_id ON user_courses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(is_published);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- Insert sample categories if they don't exist
INSERT INTO categories (name, icon, color) VALUES
    ('تندخوانی', 'fa-book', '#184277'),
    ('تقویت حافظه', 'fa-brain', '#397c7c'),
    ('تمرکز و تحرک', 'fa-eye', '#8b5cf6'),
    ('کودک', 'fa-child-reaching', '#ec4899'),
    ('نوجوان', 'fa-user-graduate', '#f59e0b'),
    ('بزرگسال', 'fa-user-tie', '#06b6d4')
ON CONFLICT (name) DO NOTHING;

-- Insert sample courses if they don't exist
INSERT INTO courses (course_id, title, description, price, is_free, category_id, image_url, instructor, rating, age_group, is_active) VALUES
    ('course-1', 'دوره تندخوانی مقدماتی', 'یاد بگیرید چگونه سریع‌تر و بهتر بخوانید', 0, true, 1, '/images/courses/uiux.jpg', 'مهدی پور', 4.8, 'adult', true),
    ('course-2', 'تقویت حافظه: از صفر تا صد', 'تکنیک‌های ثابت شده برای بهبود حافظه', 299000, false, 2, '/images/courses/python.jpg', 'علی احمدی', 4.9, 'adult', true),
    ('course-3', 'تمرکز و تحرک ذهنی', 'افزایش توانایی تمرکز برای پیروزی در امتحانات', 199000, false, 3, '/images/courses/marketing.jpg', 'سارا حسینی', 4.7, 'teen', true),
    ('course-4', 'تندخوانی برای کودکان', 'دوره ویژه کودکان برای یادگیری صحیح خواندن', 149000, false, 4, '/images/courses/react.jpg', 'فاطمه محمدی', 4.6, 'kid', true),
    ('course-5', 'کنکور سراسری: نکات طلایی', 'نکات و روش‌های طلایی برای قبولی در کنکور', 399000, false, 2, '/images/courses/uiux.jpg', 'دکتر احمد علیایی', 5.0, 'teen', true),
    ('course-6', 'بهبود سرعت خواندن: پیشرفته', 'برای کسانی که می‌خواهند سرعت خواندن خود را شش برابر کنند', 499000, false, 1, '/images/courses/python.jpg', 'محمود رضایی', 4.9, 'adult', true)
ON CONFLICT (course_id) DO NOTHING;
