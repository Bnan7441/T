import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import Categories from "./components/Categories";
import AppDownload from "./components/AppDownload";
import { CourseList } from "./features/course-list/CourseList";
import TrustSection from "./components/TrustSection";
import AydinIdeasSpecial from "./components/AydinIdeasSpecial";
import Footer from "./components/Footer";
import FloatingSupport from "./components/FloatingSupport";
import ScrollToTop from "./components/ScrollToTop";
import MobileBottomNav from "./components/MobileBottomNav";
import MobileLayout from "./components/MobileLayout";
import SearchOverlay from "./components/SearchOverlay";
import NotificationDrawer from "./components/NotificationDrawer";
import AiAssistant from "./components/AiAssistant";
import ScrollProgress from "./components/ScrollProgress";
import AuthModal from '@/components/shared/AuthModal';
import InstallPrompt from "./components/InstallPrompt";
import AboutView from "./components/AboutView";
import CourseCatalog from "./components/CourseCatalog";
import { ErrorBoundary, RouteErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ErrorDisplay } from '@/components/shared/ErrorComponents';
const DashboardView = React.lazy(() => import("./components/DashboardView"));
const ProfileView = React.lazy(() => import("./components/ProfileView"));
// const CourseCatalog = React.lazy(() => import("./components/CourseCatalog")); -- Switched to static
const CourseDetailView = React.lazy(() => import("./components/CourseDetailView"));
const ArticleDetailView = React.lazy(() => import("./components/ArticleDetailView"));
const LessonView = React.lazy(() => import("./components/LessonView"));
const BlogView = React.lazy(() => import("./components/BlogView"));
const UXFeaturesDemo = React.lazy(() => import("./components/UXFeaturesDemo"));
import ClubView from "./components/ClubView";
import SitemapView from "./components/SitemapView";
import AdminView from "@/views/AdminView";
import NotFoundView from "./components/NotFoundView";
import { SpeedFocusTest } from "./features/reading-test/SpeedFocusTest";
import { TondinoProvider } from "@/context/TondinoContext";
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { AuthProvider } from '@/context/AuthContext';
import { motion, AnimatePresence } from "framer-motion";
import IconWrapper from './components/IconWrapper';

const HomeView: React.FC = () => (
  <div className="space-y-8 sm:space-y-12 lg:space-y-16 animate-in fade-in duration-500">
    <HeroSection />
    
    <div className="flex justify-center -mt-4 sm:-mt-6 md:-mt-8">
       <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-md px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-white dark:border-white/5 shadow-premium text-[8px] sm:text-[9px] md:text-[10px] font-black flex items-center gap-2 sm:gap-3">
          <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-gray-600 dark:text-gray-300 uppercase tracking-tight sm:tracking-tighter">در حال حاضر ۱۸۴ دانش‌آموز مشغول مطالعه هستند</span>
       </div>
    </div>

    <section className="relative z-10">
      <Categories />
    </section>

    <section id="featured">
      <CourseList title="دوره‌های برگزیده" horizontal />
    </section>

    <section id="new-arrivals">
      <CourseList title="تازه‌ترین‌های آموزشی" horizontal />
    </section>

    <section>
      <AydinIdeasSpecial />
    </section>

    <section>
      <AppDownload />
    </section>

    <section>
      <TrustSection />
    </section>
  </div>
);

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { setIsAuthModalOpen } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      // Redirect to home or a login page, storing the attempted path
      navigate("/", { state: { from: location.pathname }, replace: true });
    }
  }, [isAuthenticated, setIsAuthModalOpen, navigate, location]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 space-y-4">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-2xl text-brand-primary">
          <IconWrapper className="fa-solid fa-lock" fa="fa-lock" />
        </div>
        <p className="text-brand-primary dark:text-white font-black">لطفاً ابتدا وارد حساب خود شوید</p>
      </div>
    );
  }

  return <Outlet />;
};

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { setIsAuthModalOpen } = useUI();

  useEffect(() => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
    }
  }, [isAuthenticated, setIsAuthModalOpen]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 space-y-4">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-2xl text-brand-primary">
          <IconWrapper className="fa-solid fa-lock" fa="fa-lock" />
        </div>
        <p className="text-brand-primary dark:text-white font-black">لطفاً ابتدا وارد حساب خود شوید</p>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-10 space-y-4">
        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center text-2xl text-brand-primary">
          <IconWrapper className="fa-solid fa-triangle-exclamation" fa="fa-triangle-exclamation" />
        </div>
        <p className="text-brand-primary dark:text-white font-black">دسترسی به پنل مدیریت برای شما مجاز نیست</p>
      </div>
    );
  }

  return <Outlet />;
};

const Layout: React.FC = () => {
  const location = useLocation();
  const isLessonRoute = /^\/lesson(\/|$)/.test(location.pathname);
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-white dark:bg-slate-900 transition-colors duration-300" dir="rtl">
        <ScrollProgress key={location.pathname} /> {/* Reset scroll progress on route change */}
        {!isLessonRoute && <Header />}

        <main className={isLessonRoute ? 'flex-grow' : 'flex-grow pt-20 md:pt-28 pb-20 px-3 sm:px-6 lg:px-8'}>
          {isLessonRoute ? (
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            >
              <RouteErrorBoundary>
                <Outlet />
              </RouteErrorBoundary>
            </Suspense>
          ) : (
            <div className="max-w-7xl mx-auto">
              <MobileLayout>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key={location.pathname} // Animate based on pathname
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full"
                  >
                    <Suspense
                      fallback={
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="w-10 h-10 border-4 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      }
                    >
                      <RouteErrorBoundary>
                        <Outlet /> {/* Render nested routes here */}
                      </RouteErrorBoundary>
                    </Suspense>
                  </motion.div>
                </AnimatePresence>
              </MobileLayout>
            </div>
          )}
        </main>

        {!isLessonRoute && <Footer className="hidden lg:block" />}
        <ScrollToTop />
        {!isLessonRoute && <FloatingSupport />}
        {!isLessonRoute && <MobileBottomNav />}
        <SearchOverlay />
        <NotificationDrawer />
        {!isLessonRoute && <AiAssistant />}
        <AuthModal />
        <SpeedFocusTest />
        <InstallPrompt />
        <ErrorDisplay />
      </div>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TondinoProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeView />} /> {/* Home page */}
            <Route path="courses" element={<CourseCatalog />} />
            <Route path="club" element={<ClubView />} />
            <Route path="about" element={<AboutView />} />
            <Route path="course-detail/:id" element={<CourseDetailView />} /> {/* Example with ID param */}
            <Route path="article-detail/:id" element={<ArticleDetailView />} />
            <Route path="lesson/:id" element={<LessonView />} />
            <Route path="blog" element={<BlogView />} />
            <Route path="sitemap" element={<SitemapView />} />
            <Route path="speed-focus-test" element={<SpeedFocusTest />} />
            <Route path="x-demo" element={<UXFeaturesDemo />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<DashboardView />} />
              <Route path="profile" element={<ProfileView />} />
            </Route>

            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFoundView />} />
          </Route>

          {/* Admin Route - Standalone Layout */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminView />} />
          </Route>
        </Routes>
        </BrowserRouter>
      </TondinoProvider>
    </AuthProvider>
  );
};

export default App;
