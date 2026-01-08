import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import IconWrapper from '../IconWrapper';
import { User } from './types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.users.getAll();
      setUsers(data.users);
    } catch (err: any) {
      setError(err.message || 'خطا در دریافت کاربران');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleAdmin = async (userId: number, currentStatus: boolean) => {
    setLoading(true);
    setError('');
    try {
      await adminAPI.users.update(userId, { is_admin: !currentStatus });
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'خطا در تغییر وضعیت ادمین');
      setLoading(false);
    }
  };

  if (loading && users.length === 0) return <div className="text-center py-10">در حال دریافت کاربران...</div>;

  return (
    <div>
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">مدیریت کاربران</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-sm text-red-600 dark:text-red-400 font-bold">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">نام</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">ایمیل</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">دوره‌ها</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">امتیاز</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">نقش</th>
                <th className="px-6 py-4 text-right text-xs font-black text-gray-500 dark:text-gray-400 uppercase">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{user.courses_count || 0}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{user.points || 0}</td>
                  <td className="px-6 py-4">
                    {user.is_admin ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                        <IconWrapper className="fa-solid fa-shield-halved ml-1" fa="fa-shield-halved" />
                        ادمین
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                        کاربر
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition-colors ${
                        user.is_admin
                          ? 'bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400'
                          : 'bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {user.is_admin ? 'حذف ادمین' : 'تبدیل به ادمین'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
