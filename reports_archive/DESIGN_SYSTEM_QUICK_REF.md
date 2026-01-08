# 🎨 Tondino Design System - Quick Reference

**Version:** 2.0 (Post Deep Clean)  
**Last Updated:** January 7, 2026

---

## 🎯 Core Design Principles

### **The Zen Commandments:**

1. **"If it's not brand, it's not right"** - Use defined colors only
2. **"Two breakpoints max"** - Mobile (base) + Desktop (lg:)
3. **"Semantic over specific"** - `.card-base` not `.rounded-base shadow-premium bg-white...`
4. **"Motion with purpose"** - Animate state changes, not decorations
5. **"Less is more"** - Simplify before adding

---

## 🎨 Color Palette

### **Brand Colors (Primary Use)**
```css
brand-primary      #184277   /* Main brand, headers, CTAs */
brand-primaryDark  #0a1d37   /* Hover states */
brand-accent       #397c7c   /* Interactive elements, highlights */
brand-accentDark   #2d6363   /* Accent hover */
brand-surface      #f8fafc   /* Light backgrounds */
brand-card         #ffffff   /* Card backgrounds */
```

### **Semantic Colors (Secondary Use)**
```css
/* Use Tailwind defaults with semantic meaning */
Success: green-500
Warning: orange-500  
Error: red-500
Info: blue-500
```

**❌ DON'T USE:** `bg-orange-50`, `text-blue-500` without semantic context  
**✅ DO USE:** `bg-brand-accent`, `text-brand-primary`

---

## 📐 Spacing Scale

### **Standard Tailwind (Preferred)**
```css
p-4    /* 1rem = 16px */
p-6    /* 1.5rem = 24px */
p-8    /* 2rem = 32px */
gap-4  /* 1rem */
gap-6  /* 1.5rem */
```

### **Custom Tokens (Mobile Only)**
```css
mobile-nav: 4rem              /* Bottom nav height */
safe-bottom: calc(4rem + env(safe-area-inset-bottom))
```

**Rule:** Use standard Tailwind spacing. Avoid custom values unless mobile-specific.

---

## 🔲 Border Radius

### **4-Tier Semantic Scale**
```css
rounded-sm    0.5rem   /* Buttons, inputs, small elements */
rounded-base  1rem     /* Standard cards, containers */
rounded-lg    1.5rem   /* Modals, drawers, dialogs */
rounded-xl    2rem     /* Hero elements, feature cards */
```

**❌ DON'T USE:** `rounded-[1.5rem]`, `rounded-2xl`, `rounded-3xl`  
**✅ DO USE:** `rounded-sm`, `rounded-base`, `rounded-lg`, `rounded-xl`

---

## ☁️ Shadows

### **4 Semantic Variants**
```css
shadow-soft        /* Subtle elevation (buttons, inputs) */
shadow-premium     /* Standard cards */
shadow-glow        /* Interactive/highlighted elements */
shadow-card-hover  /* Hover states for cards */
```

**When to use:**
- `shadow-soft` → Input fields, small buttons, subtle depth
- `shadow-premium` → Main content cards, default elevation
- `shadow-glow` → Active states, brand highlights, CTAs
- `shadow-card-hover` → Interactive card hover effects

**❌ REMOVED:** `shadow-glass`, `shadow-ai-glow`, `shadow-mobile-*`

---

## 📝 Typography

### **Font Weights**
```css
font-normal  400   /* Body text */
font-medium  500   /* Subheadings */
font-bold    700   /* Emphasis */
font-black   900   /* Headings, CTAs */
```

### **Fluid Font Sizes**
```css
fluid-base   clamp(1rem, 3vw, 1.125rem)     /* Body text */
fluid-lg     clamp(1.125rem, 3.5vw, 1.25rem) /* H4, subheadings */
fluid-xl     clamp(1.25rem, 4vw, 1.5rem)     /* H3 */
fluid-2xl    clamp(1.5rem, 5vw, 2rem)        /* H2 */
```

**Standard Tailwind (Still Valid):**
```css
text-sm   /* 0.875rem */
text-base /* 1rem */
text-lg   /* 1.125rem */
text-xl   /* 1.25rem */
text-2xl  /* 1.5rem */
```

---

## 🎬 Animations

### **3 Essential Animations**
```css
animate-pulse-soft  /* Subtle breathing (4s pulse) */
animate-fade-in     /* Entrance (0.3s fade) */
animate-slide-up    /* Content reveal (0.4s slide) */
```

**Transition Durations:**
```css
duration-150  /* Hover effects */
duration-300  /* State changes (default) */
duration-500  /* Page transitions */
```

**❌ REMOVED:** `animate-float-slow`, `animate-bounce-light` (excessive decoration)

---

## 📱 Responsive Breakpoints

### **Mobile-First, 2-Breakpoint Rule**
```tsx
/* ❌ BAD: Too many breakpoints */
<div className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10">

/* ✅ GOOD: Mobile + Desktop */
<div className="p-4 lg:p-8">
```

**Standard Breakpoints:**
```css
sm:  640px   /* Rarely use - prefer base */
md:  768px   /* Avoid - creates maintenance burden */
lg:  1024px  /* Primary desktop breakpoint */
xl:  1280px  /* Rarely use */
```

**Rule:** Use `base` (mobile) and `lg:` (desktop). Avoid `sm:`, `md:`, `xl:`.

---

## 🧩 Semantic Utility Classes

### **Navigation**
```tsx
<Link className="nav-link text-sm lg:text-base">
  /* Includes: hover, dark mode, transitions */
```

### **Cards**
```tsx
/* Static card */
<div className="card-base">

/* Interactive card */
<div className="card-interactive">
  /* Includes: hover, cursor, scale effect */
```

### **Buttons**
```tsx
/* Base (use with variants) */
<button className="btn-base bg-brand-accent ...">

/* Pre-styled primary */
<button className="btn-primary">
  /* Full brand styling */
```

### **Section Spacing**
```tsx
<div className="section-spacing">
  /* Responsive: space-y-8 sm:space-y-12 lg:space-y-16 */
```

---

## ✅ Component Patterns

### **Card Component**
```tsx
// Standard card
<div className="card-base p-6 lg:p-8">
  <h3 className="text-fluid-xl font-black text-brand-primary">Title</h3>
  <p className="text-fluid-base text-gray-600 dark:text-gray-300">Content</p>
</div>

// Interactive card
<div className="card-interactive p-6 lg:p-8" onClick={handleClick}>
  {/* Auto includes hover, cursor, scale */}
</div>
```

### **Button Component**
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md">
  Click Me
</Button>

// Variants: primary, secondary, outline, accent
// Sizes: sm, md, lg
```

### **Navigation Link**
```tsx
<Link to="/path" className="nav-link text-sm lg:text-base">
  Link Text
</Link>
```

### **Icon Container**
```tsx
<div className="w-10 lg:w-12 h-10 lg:h-12 rounded-base bg-brand-accent/10 text-brand-accent flex items-center justify-center">
  <Icon fa="fa-star" />
</div>
```

---

## ⚠️ Common Mistakes to Avoid

### **1. Too Many Breakpoints**
```tsx
❌ className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8"
✅ className="p-4 lg:p-8"
```

### **2. Custom Border Radius**
```tsx
❌ className="rounded-[1.5rem]"
✅ className="rounded-lg"
```

### **3. Non-Brand Colors**
```tsx
❌ className="bg-blue-500 text-orange-600"
✅ className="bg-brand-primary text-brand-accent"
```

### **4. Inline Styles for Theme**
```tsx
❌ <div style={{ borderRadius: '1.5rem' }}>
✅ <div className="rounded-lg">
```

### **5. Repeated Classes**
```tsx
❌ className="text-gray-700 dark:text-gray-300 hover:text-brand-primary dark:hover:text-white font-bold transition-colors"
✅ className="nav-link"
```

---

## 🔍 Quick Decision Tree

### **"Should I add a new shadow variant?"**
→ **NO.** Use existing: soft, premium, glow, card-hover

### **"Should I use `md:` breakpoint?"**
→ **NO.** Use `base` (mobile) and `lg:` (desktop) only

### **"Should I create custom spacing?"**
→ **NO.** Use standard Tailwind: 4, 6, 8, 12, 16

### **"Should I use `bg-blue-500`?"**
→ **ONLY** if semantic (success, info, warning). Otherwise use `brand-*`

### **"Should I add auto-scrolling animation?"**
→ **NO.** User-initiated only. Motion with purpose.

---

## 📚 Further Reading

- [DEEP_CLEAN_AUDIT.md](./DEEP_CLEAN_AUDIT.md) - Full rationale
- [DEEP_CLEAN_IMPLEMENTATION.md](./DEEP_CLEAN_IMPLEMENTATION.md) - Migration guide
- [Tailwind Config](./tondino-frontend/tailwind.config.js) - Source of truth
- [index.css](./tondino-frontend/src/index.css) - Semantic utilities

---

**Remember:** Less is more. Simplify before adding. 🧘

