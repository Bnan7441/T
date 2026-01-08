import React, { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import IconWrapper from '../IconWrapper';
import { Stats } from './types';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminAPI.stats.get();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Error loading stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center py-10">در حال بارگذاری آمار...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">کل کاربران</p>
            <p className="text-3xl font-black text-brand-primary dark:text-white mt-2">{stats.totalUsers}</p>
          </div>
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
            <IconWrapper className="fa-solid fa-users text-2xl text-blue-600 dark:text-blue-400" fa="fa-users" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">کل دوره‌ها</p>
            <p className="text-3xl font-black text-brand-primary dark:text-white mt-2">{stats.totalCourses}</p>
          </div>
          <div className="w-14 h-14 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
            <IconWrapper className="fa-solid fa-graduation-cap text-2xl text-green-600 dark:text-green-400" fa="fa-graduation-cap" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">کل خریدها</p>
            <p className="text-3xl font-black text-brand-primary dark:text-white mt-2">{stats.totalPurchases}</p>
          </div>
          <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
            <IconWrapper className="fa-solid fa-shopping-cart text-2xl text-purple-600 dark:text-purple-400" fa="fa-shopping-cart" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">کل درآمد</p>
            <p className="text-3xl font-black text-brand-primary dark:text-white mt-2">
              {stats.totalRevenue.toLocaleString('fa-IR')}
              <span className="text-sm mr-1">تومان</span>
            </p>
          </div>
          <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center">
            <IconWrapper className="fa-solid fa-coins text-2xl text-yellow-600 dark:text-yellow-400" fa="fa-coins" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
