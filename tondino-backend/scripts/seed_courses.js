const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

(async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database for seeding...');

    // 1. Seed Categories
    console.log('Seeding Categories...');
    const categories = [
        { name: 'programming', icon: 'code', color: '#3B82F6' },
        { name: 'design', icon: 'palette', color: '#EC4899' },
        { name: 'business', icon: 'briefcase', color: '#10B981' },
        { name: 'marketing', icon: 'chart-line', color: '#F59E0B' }
    ];

    for (const cat of categories) {
        await client.query(
            `INSERT INTO categories (name, icon, color) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (name) DO UPDATE SET icon = $2, color = $3`,
            [cat.name, cat.icon, cat.color]
        );
    }

    // Get Category IDs
    const catRes = await client.query('SELECT id, name FROM categories');
    const catMap = {};
    catRes.rows.forEach(r => catMap[r.name] = r.id);

    // 2. Seed Courses
    console.log('Seeding Courses...');
    const courses = [
        {
            course_id: 'react-mastery',
            title: 'آموزش جامع React و Next.js',
            description: 'در این دوره جامع، از مفاهیم پایه‌ای React شروع می‌کنیم و تا پیشرفته‌ترین مباحث Next.js پیش می‌رویم.',
            price: 2500000,
            is_free: false,
            category_id: catMap['programming'],
            image_url: '/images/courses/react.jpg',
            instructor: 'آیدین',
            rating: 4.9
        },
        {
            course_id: 'ui-design-pro',
            title: 'طراحی رابط کاربری حرفه‌ای (UI/UX)',
            description: 'یادگیری اصول طراحی مدرن، کار با Figma و ایجاد تجربه کاربری فوق‌العاده.',
            price: 1800000,
            is_free: false,
            category_id: catMap['design'],
            image_url: '/images/courses/uiux.jpg',
            instructor: 'سارا',
            rating: 4.8
        },
        {
             course_id: 'python-intro',
             title: 'مبانی پایتون برای همه',
             description: 'شروع برنامه‌نویسی با زبان قدرتمند پایتون. مناسب برای مبتدیان.',
             price: 0,
             is_free: true,
             category_id: catMap['programming'],
             image_url: '/images/courses/python.jpg',
             instructor: 'علی',
             rating: 4.7
        },
        {
            course_id: 'digital-marketing',
            title: 'استراتژی‌های دیجیتال مارکتینگ ۲۰۲۵',
            description: 'چگونه در دنیای دیجیتال دیده شویم؟ سئو، تبلیغات کلیکی و بازاریابی محتوایی.',
            price: 1200000,
            is_free: false,
            category_id: catMap['marketing'],
            image_url: '/images/courses/marketing.jpg',
            instructor: 'مریم',
            rating: 4.6
       }
    ];

    for (const course of courses) {
        // Insert or Update Course
        const res = await client.query(
            `INSERT INTO courses (course_id, title, description, price, is_free, category_id, image_url, instructor, rating)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             ON CONFLICT (course_id) DO UPDATE SET 
                title = $2, description = $3, price = $4, is_free = $5, 
                category_id = $6, image_url = $7, instructor = $8, rating = $9
             RETURNING id`,
            [course.course_id, course.title, course.description, course.price, course.is_free, course.category_id, course.image_url, course.instructor, course.rating]
        );
        const courseId = res.rows[0].id;

        // 3. Seed Lessons for this course
        console.log(`Seeding Lessons for ${course.title}...`);
        const lessons = [
            {
                title: 'مقدمه و معرفی دوره',
                description: 'در این جلسه با مسیر یادگیری آشنا می‌شویم.',
                content: 'متن جلسه اول...',
                video_url: 'https://example.com/videos/intro.mp4',
                duration: '10:00',
                order_index: 0,
                is_free: true
            },
            {
                title: 'نصب و راه‌اندازی محیط کار',
                description: 'نصب VS Code و ابزارهای مورد نیاز.',
                content: 'دستورات نصب...',
                video_url: 'https://example.com/videos/setup.mp4',
                duration: '15:30',
                order_index: 1,
                is_free: true
            },
            {
                title: 'اولین پروژه عملی',
                description: 'ساخت یک برنامه Hello World.',
                content: 'کد برنامه...',
                video_url: 'https://example.com/videos/hello.mp4',
                duration: '25:00',
                order_index: 2,
                is_free: false
            }
        ];

        for (const lesson of lessons) {
            // Simple check to avoid duplicates for now (based on course_id and order_index)
             await client.query(
                `INSERT INTO lessons (course_id, title, description, content, video_url, duration, order_index, is_free)
                 SELECT $1, $2, $3, $4, $5, $6, $7, $8
                 WHERE NOT EXISTS (
                    SELECT 1 FROM lessons WHERE course_id = $1 AND order_index = $7
                 )`,
                [courseId, lesson.title, lesson.description, lesson.content, lesson.video_url, lesson.duration, lesson.order_index, lesson.is_free]
            );
        }
    }

    console.log('Seeding completed successfully!');
    await client.end();
  } catch (err) {
    console.error('Seeding failed:', err);
    await client.end();
    process.exit(1);
  }
})();
