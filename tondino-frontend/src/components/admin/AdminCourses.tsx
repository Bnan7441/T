import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { Button } from '../ui/Button';
import IconWrapper from '../IconWrapper';
import { Course, Category, Lesson } from './types';

const AdminCourses: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  // We need to fetch categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await adminAPI.categories.getAll();
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    };
    loadCategories();
    // fetchCourses is called below via its own useEffect
  }, []);

  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    course_id: '',
    title: '',
    description: '',
    price: 0,
    is_free: false,
    image_url: '',
    category_id: undefined as number | undefined,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [showLessonsModal, setShowLessonsModal] = useState(false);
  const [selectedCourseForLessons, setSelectedCourseForLessons] = useState<Course | null>(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    video_url: '',
    order_index: 0,
    duration: '',
    is_free: false,
  });


  const [loading, setLoading] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminAPI.courses.getAll(filterCategoryId || undefined);
      const rawCourses = (data as any).courses || [];
      const normalizedCourses: Course[] = rawCourses.map((course: any) => ({
        ...course,
        price: Number(course?.price ?? 0) || 0,
      }));
      setCourses(normalizedCourses);
    } catch (err: any) {
        setError(err.message || 'خطا در بارگذاری دوره‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [filterCategoryId]);

  // Handlers
  const handleCreateCourse = () => {
    setCourseForm({
      course_id: '',
      title: '',
      description: '',
      price: 0,
      is_free: false,
      image_url: '',
      category_id: undefined,
    });
    setImagePreview('');
    setEditingCourse(null);
    setShowCourseModal(true);
  };

  const handleEditCourse = (course: Course) => {
    setCourseForm({
      course_id: String(course.course_id || ''),
      title: course.title,
      description: course.description || '',
      price: Number((course as any).price ?? 0) || 0,
      is_free: course.is_free,
      image_url: course.image_url || '',
      category_id: course.category_id,
    });
    setImagePreview(course.image_url || '');
    setEditingCourse(course);
    setShowCourseModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('لطفاً فقط فایل تصویر انتخاب کنید');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم تصویر نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    setUploadingImage(true);
    setError('');

    try {
      const { imageUrl } = await adminAPI.uploadCourseImage(file);
      setCourseForm(prev => ({ ...prev, image_url: imageUrl }));
      setImagePreview(imageUrl);
    } catch (err: any) {
      setError(err.message || 'خطا در آپلود تصویر');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveCourse = async () => {
    setError('');
    try {
      if (editingCourse) {
        await adminAPI.courses.update(Number(editingCourse.id), {
          title: courseForm.title,
          description: courseForm.description,
          price: courseForm.price,
          is_free: courseForm.is_free,
          image_url: courseForm.image_url,
          category_id: courseForm.category_id,
        });
      } else {
        await adminAPI.courses.create(courseForm);
      }
      setShowCourseModal(false);
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره دوره');
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این دوره را حذف کنید؟')) return;

    try {
      await adminAPI.courses.delete(id);
      fetchCourses();
    } catch (err: any) {
      setError(err.message || 'خطا در حذف دوره');
    }
  };

  const handleViewLessons = async (course: Course) => {
    setSelectedCourseForLessons(course);
    setShowLessonsModal(true);
    try {
      const data = await adminAPI.lessons.getByCourse(Number(course.id));
      setLessons(data.lessons);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت درس‌ها');
    }
  };

  const handleCreateLesson = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      video_url: '',
      order_index: lessons.length,
      duration: '',
      is_free: false,
    });
    setEditingLesson(null);
    setShowLessonModal(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      order_index: lesson.order_index,
      duration: String(lesson.duration),
      is_free: lesson.is_free,
    });
    setEditingLesson(lesson);
    setShowLessonModal(true);
  };

  const handleSaveLesson = async () => {
    if (!selectedCourseForLessons) return;

    setError('');
    try {
      if (editingLesson) {
        await adminAPI.lessons.update(Number(editingLesson.id), lessonForm);
      } else {
        await adminAPI.lessons.create(Number(selectedCourseForLessons.id), lessonForm);
      }
      setShowLessonModal(false);
      const data = await adminAPI.lessons.getByCourse(Number(selectedCourseForLessons.id));
      setLessons(data.lessons);
    } catch (err: any) {
      setError(err.message || 'خطا در ذخیره درس');
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm('آیا مطمئن هستید که می‌خواهید این درس را حذف کنید؟')) return;
    if (!selectedCourseForLessons) return;

    try {
      await adminAPI.lessons.delete(id);
      const data = await adminAPI.lessons.getByCourse(Number(selectedCourseForLessons.id));
      setLessons(data.lessons);
    } catch (err: any) {
      setError(err.message || 'خطا در حذف درس');
    }
  };

  return (
    <div>
      {/* Header & Filter */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">مدیریت دوره‌ها</h2>
          <select
            value={filterCategoryId || ''}
            onChange={(e) => setFilterCategoryId(e.target.value ? parseInt(e.target.value) : null)}
            className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-xl py-2 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
          >
            <option value="">همه دسته‌بندی‌ها</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleCreateCourse} variant="accent">
          <IconWrapper className="fa-solid fa-plus ml-2" fa="fa-plus" />
          افزودن دوره جدید
        </Button>
      </div>

       {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
          </div>
        )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex items-center justify-center p-8">
               <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">عنوان</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">شناسه</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">دسته‌بندی</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">قیمت</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">وضعیت</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900 dark:text-white">{course.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{course.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">{course.course_id}</td>
                  <td className="px-6 py-4">
                    {course.category_name ? (
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: course.category_color ? `${course.category_color}20` : '#f1f5f9',
                          color: course.category_color || '#64748b'
                        }}
                      >
                        {course.category_icon && <IconWrapper fa={course.category_icon} className={`${course.category_icon} ml-1`} />}
                        {course.category_name}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-500">بدون دسته‌بندی</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {course.is_free ? (
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        رایگان
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {Number((course as any).price ?? 0).toLocaleString('fa-IR')} تومان
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {course.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        فعال
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        غیرفعال
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                       <button
                        onClick={() => handleViewLessons(course)}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-bold transition-colors"
                        title="مدیریت درس‌ها"
                      >
                        <IconWrapper className="fa-solid fa-book-open" fa="fa-book-open" />
                      </button>
                      <button
                        onClick={() => handleEditCourse(course)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold transition-colors"
                        title="ویرایش"
                      >
                        <IconWrapper className="fa-solid fa-edit" fa="fa-edit" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(Number(course.id))}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors"
                        title="حذف"
                      >
                        <IconWrapper className="fa-solid fa-trash" fa="fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

       {/* Course Modal */}
      {showCourseModal && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-brand-primary/40 backdrop-blur-xl animate-in fade-in"
            onClick={() => setShowCourseModal(false)}
          />
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in duration-300">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-black text-brand-primary dark:text-white">
                  {editingCourse ? 'ویرایش دوره' : 'افزودن دوره جدید'}
                </h2>

                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">شناسه یکتا</label>
                    <input
                      type="text"
                      value={courseForm.course_id}
                      onChange={(e) => setCourseForm({ ...courseForm, course_id: e.target.value })}
                      placeholder="speed-reading-101"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">عنوان دوره</label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                      placeholder="تندخوانی پیشرفته"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                    <textarea
                      value={courseForm.description}
                      onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                      placeholder="توضیحات کامل دوره..."
                      rows={4}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">قیمت (تومان)</label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) || 0 })}
                      placeholder="299000"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">تصویر دوره</label>
                    <div className="space-y-3">
                      {imagePreview && (
                        <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5">
                          <img
                            src={imagePreview.startsWith('http') ? imagePreview : `/api${imagePreview}`}
                            alt="پیش‌نمایش"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                          id="course-image-upload"
                        />
                        <label
                          htmlFor="course-image-upload"
                          className={`block w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-all ${
                            uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingImage ? (
                            <>
                              <IconWrapper className="fa-solid fa-spinner fa-spin ml-2" fa="fa-spinner" />
                              در حال آپلود...
                            </>
                          ) : (
                            <>
                              <IconWrapper className="fa-solid fa-cloud-arrow-up ml-2" fa="fa-cloud-arrow-up" />
                              {imagePreview ? 'تغییر تصویر' : 'انتخاب تصویر'}
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">دسته‌بندی</label>
                    <select
                      value={courseForm.category_id || ''}
                      onChange={(e) => setCourseForm({ ...courseForm, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    >
                      <option value="">بدون دسته‌بندی</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="is_free"
                      checked={courseForm.is_free}
                      onChange={(e) => setCourseForm({ ...courseForm, is_free: e.target.checked })}
                      className="w-5 h-5 text-brand-accent rounded focus:ring-2 focus:ring-brand-accent"
                    />
                    <label htmlFor="is_free" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      دوره رایگان است
                    </label>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveCourse} variant="accent" className="flex-1">
                    <IconWrapper className="fa-solid fa-save ml-2" fa="fa-save" />
                    ذخیره
                  </Button>
                  <Button onClick={() => setShowCourseModal(false)} variant="secondary" className="flex-1">
                    انصراف
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Lessons Modal */}
      {showLessonsModal && selectedCourseForLessons && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowLessonsModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
               {/* Lessons Modal Content */}
               <div className="p-6 border-b border-gray-200 dark:border-white/5">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                      <IconWrapper className="fa-solid fa-book-open ml-2" fa="fa-book-open" />
                      درس‌های دوره: {selectedCourseForLessons.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowLessonsModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <IconWrapper className="fa-solid fa-times text-2xl" fa="fa-times" />
                  </button>
                </div>
              </div>

               <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                 <div className="mb-4">
                  <Button onClick={handleCreateLesson} variant="accent">
                    <IconWrapper className="fa-solid fa-plus ml-2" fa="fa-plus" />
                    افزودن درس جدید
                  </Button>
                </div>

                   {lessons.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <IconWrapper className="fa-solid fa-book-open text-4xl mb-4" fa="fa-book-open" />
                    <p>هنوز درسی اضافه نشده است</p>
                  </div>
                ) : (
                   <div className="space-y-3">
                    {lessons.map((lesson, index) => (
                      <div
                        key={lesson.id}
                        className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-white/5"
                      >
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             <div className="flex items-center gap-3 mb-2">
                               <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent/10 text-brand-accent font-bold text-sm">
                                {index + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 dark:text-white">{lesson.title}</h3>
                             </div>
                           </div>
                            <div className="flex gap-2">
                            <button
                              onClick={() => handleEditLesson(lesson)}
                              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold transition-colors"
                            >
                              <IconWrapper className="fa-solid fa-edit" fa="fa-edit" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(Number(lesson.id))}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors"
                            >
                              <IconWrapper className="fa-solid fa-trash" fa="fa-trash" />
                            </button>
                          </div>
                         </div>
                      </div>
                    ))}
                   </div>
                )}
               </div>
            </div>
          </div>
        </>
      )}

      {/* Lesson Edit/Create Modal */}
      {showLessonModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowLessonModal(false)}></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-white/5">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  <IconWrapper className="fa-solid fa-book ml-2" fa="fa-book" />
                  {editingLesson ? 'ویرایش درس' : 'افزودن درس جدید'}
                </h2>
              </div>
               <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                 <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      عنوان درس *
                    </label>
                    <input
                      type="text"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="مثال: مقدمه‌ای بر تندخوانی"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                       توضیحات
                    </label>
                     <textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>
                  {/* ... other fields ... */}
                   <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      لینک ویدیو
                    </label>
                    <input
                      type="url"
                      value={lessonForm.video_url}
                      onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                      dir="ltr"
                    />
                  </div>
                 </div>

                 <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveLesson} variant="accent" className="flex-1">
                    <IconWrapper className="fa-solid fa-save ml-2" fa="fa-save" />
                    ذخیره
                  </Button>
                  <Button onClick={() => setShowLessonModal(false)} variant="secondary" className="flex-1">
                    انصراف
                  </Button>
                </div>
               </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCourses;
