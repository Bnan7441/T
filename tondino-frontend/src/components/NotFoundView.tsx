import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Icon from './Icon';

const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-6 py-20 px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-32 h-32 bg-gradient-to-br from-brand-primary/10 to-brand-accent/10 rounded-full flex items-center justify-center text-6xl border-2 border-dashed border-brand-primary/20"
      >
        <Icon fa="fa-triangle-exclamation" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-3 max-w-md"
      >
        <h1 className="text-5xl md:text-6xl font-black text-brand-primary dark:text-white">
          ۴۰۴
        </h1>
        <p className="text-2xl font-black text-gray-700 dark:text-gray-200">
          صفحه پیدا نشد!
        </p>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          متأسفانه صفحه‌ای که به دنبال آن می‌گردید وجود ندارد. لطفاً به صفحه اصلی برگردید.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex gap-4"
      >
        <Link
          to="/"
          className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black hover:bg-brand-accent transition-colors shadow-lg"
        >
          بازگشت به خانه
        </Link>
        <Link
          to="/courses"
          className="px-8 py-4 bg-white dark:bg-slate-800 text-brand-primary dark:text-white rounded-2xl font-black hover:shadow-lg transition-all border border-gray-200 dark:border-white/10"
        >
          مرور دوره‌ها
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFoundView;
