import React, { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import AdminDashboard from '@/components/admin/AdminDashboard';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminCourses from '@/components/admin/AdminCourses';
import AdminUsers from '@/components/admin/AdminUsers';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'users' | 'categories'>('dashboard');

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <AdminDashboard />}
      {activeTab === 'courses' && <AdminCourses />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'categories' && <AdminCategories />}
    </AdminLayout>
  );
};

export default AdminView;
