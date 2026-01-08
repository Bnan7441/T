# 🎨 راهنمای سریع - اصلاحات صفحه اصلی

## خلاصه تغییرات

### ❌ مشکلات قبل
```
• فاصله‌های بی‌نظم و ناهماهنگ
• اندازه‌های نامناسب برای موبایل
• overflow افقی و قطع شدگی
• رنگ پس‌زمینه خاکستری
• متن‌های نخواندنی
```

### ✅ اصلاحات بعد
```
• فاصله‌های منطقی و تطبیقی
• اندازه‌های صحیح برای تمام دستگاه‌ها
• بدون overflow و خوب‌نمایش شده
• رنگ پس‌زمینه سفید/تیره
• متن‌های خواناتر و صحیح‌اندازه
```

---

## 📐 نقاط کلیدی اصلاح

### 1. Padding بالای صفحه
```tsx
// قبل
main className="pt-28 md:pt-36"

// بعد
main className="pt-20 md:pt-28"
```

### 2. رنگ پس‌زمینه
```tsx
// قبل
div className="bg-[#f3f4f6]"

// بعد
div className="bg-white dark:bg-slate-900"
```

### 3. فاصله بین بخش‌ها
```tsx
// قبل
space-y-12 lg:space-y-20

// بعد
space-y-8 sm:space-y-12 lg:space-y-16
```

### 4. اندازه عنوان Hero
```tsx
// قبل
h1 className="text-4xl md:text-7xl"

// بعد
h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
```

---

## 🔧 Tailwind Classes استفاده شده

### Responsive Padding
```
px-3         → 12px (موبایل)
px-3 sm:px-6 → 24px (تبلت)
px-6 lg:px-8 → 32px (دسکتاپ)
```

### Responsive Height
```
h-[240px]       → موبایل
sm:h-[320px]    → تبلت کوچک
md:h-[480px]    → تبلت بزرگ
lg:h-[520px]    → دسکتاپ
```

### Responsive Typography
```
text-xs sm:text-sm md:text-base lg:text-lg
```

---

## 📱 Breakpoints

| نام | از | تا |
|-----|----|----|
| موبایل | 320px | 639px |
| sm | 640px | 767px |
| md | 768px | 1023px |
| lg | 1024px | 1279px |
| xl | 1280px+ | ∞ |

---

## 📂 فایل‌های تغییر‌یافته

```
✅ src/App.tsx
✅ src/index.css
✅ src/components/HeroSection.tsx
✅ src/components/Categories.tsx
✅ src/components/Header.tsx
✅ src/components/Footer.tsx
✅ src/features/course-list/CourseList.tsx
✅ tailwind.config.js
```

---

## 💡 نکات مهم

### ✅ صحیح
```tsx
<div className="px-3 sm:px-6 md:px-8 lg:px-12">
<div className="space-y-4 sm:space-y-6 md:space-y-8">
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
```

### ❌ غلط
```tsx
<div className="px-4">
<div className="space-y-6">
<div className="grid grid-cols-4">
```

---

**نسخه**: 1.0 | **تاریخ**: 7 ژانویه 2026 | **وضعیت**: ✅ آماده
