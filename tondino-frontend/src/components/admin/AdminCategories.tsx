import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { Button } from '../ui/Button';
import IconWrapper from '../IconWrapper';
import { Category } from './types';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#2f6969', // brand-accent
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.categories.getAll();
      setCategories(data.categories);
    } catch (err: any) {
      setError(err.message || 'Error loading categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      icon: '',
      color: '#2f6969',
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '#2f6969',
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) return;

    try {
      await adminAPI.categories.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert('خطا در حذف دسته‌بندی');
      console.error(err);
    }
  };

  const handleSaveCategory = async () => {
    try {
      const data = {
        name: categoryForm.name,
        description: categoryForm.description,
        icon: categoryForm.icon,
        color: categoryForm.color,
      };

      if (editingCategory) {
        await adminAPI.categories.update(editingCategory.id, data);
      } else {
        await adminAPI.categories.create(data);
      }

      setShowCategoryModal(false);
      fetchCategories();
    } catch (err: any) {
      alert('خطا در ذخیره دسته‌بندی');
      console.error(err);
    }
  };

  if (loading && categories.length === 0) return <div className="text-center py-10">در حال دریافت دسته‌بندی‌ها...</div>;

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">مدیریت دسته‌بندی‌ها</h2>
        <Button onClick={handleCreateCategory} variant="accent">
          <IconWrapper className="fa-solid fa-plus ml-2" fa="fa-plus" />
          افزودن دسته‌بندی جدید
        </Button>
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">نام</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">توضیحات</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">آیکون</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">رنگ</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {category.icon && <IconWrapper fa={category.icon} className={`${category.icon}`} />}
                      <span className="font-bold text-gray-900 dark:text-white">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {category.description || 'بدون توضیحات'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                    {category.icon || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-gray-200 dark:border-white/5"
                        style={{ backgroundColor: category.color || '#2f6969' }}
                      ></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                        {category.color || '#2f6969'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-bold transition-colors"
                      >
                        <IconWrapper className="fa-solid fa-edit" fa="fa-edit" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg text-sm font-bold transition-colors"
                      >
                        <IconWrapper className="fa-solid fa-trash" fa="fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <>
          <div
            className="fixed inset-0 z-[150] bg-brand-primary/40 backdrop-blur-xl animate-in fade-in"
            onClick={() => setShowCategoryModal(false)}
          />
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto animate-in zoom-in duration-300">
              <div className="p-8 space-y-6">
                <h2 className="text-2xl font-black text-brand-primary dark:text-white">
                  {editingCategory ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">نام دسته‌بندی</label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      placeholder="تندخوانی"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">توضیحات</label>
                    <textarea
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      placeholder="توضیحات دسته‌بندی..."
                      rows={3}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                      آیکون (Font Awesome)
                    </label>
                    <input
                      type="text"
                      value={categoryForm.icon}
                      onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                      placeholder="fa-solid fa-bolt"
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                      dir="ltr"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      مثال: fa-solid fa-bolt, fa-solid fa-brain, fa-solid fa-book-open
                    </p>
                    {categoryForm.icon && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">پیش‌نمایش:</p>
                        <IconWrapper fa={categoryForm.icon} className={`${categoryForm.icon} text-2xl`} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">رنگ</label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        className="w-16 h-12 rounded-xl border border-gray-200 dark:border-white/5 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={categoryForm.color}
                        onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                        placeholder="#2f6969"
                        className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-2xl py-3 px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-brand-accent transition-all dark:text-white"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={handleSaveCategory} variant="accent" className="flex-1">
                    <IconWrapper className="fa-solid fa-save ml-2" fa="fa-save" />
                    ذخیره
                  </Button>
                  <Button onClick={() => setShowCategoryModal(false)} variant="secondary" className="flex-1">
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

export default AdminCategories;
