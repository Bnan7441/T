# Font Self-Hosting Guide for Vazirmatn

## Current Status
The application currently uses Google Fonts CDN to load Vazirmatn font:
```css
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;500;600;700;800;900&display=swap');
```

## Issues with Current Implementation
1. **External Dependency**: Requires connection to Google servers
2. **GDPR Concerns**: Google collects user data through font requests
3. **Performance**: Additional HTTP request adds latency
4. **Privacy**: User IP addresses are sent to Google
5. **Reliability**: Depends on Google's CDN uptime

## Recommended Solution: Self-Host Vazirmatn

### Steps to Implement

1. **Download Vazirmatn Font Files**
   - Visit [Vazirmatn GitHub Repository](https://github.com/rastikerdar/vazirmatn)
   - Download WOFF2 format files (best compression and browser support)
   - Required weights: 100, 300, 400, 500, 600, 700, 800, 900

2. **Place Font Files in Project**
   ```
   tondino-frontend/public/fonts/
   ├── Vazirmatn-Thin.woff2 (100)
   ├── Vazirmatn-Light.woff2 (300)
   ├── Vazirmatn-Regular.woff2 (400)
   ├── Vazirmatn-Medium.woff2 (500)
   ├── Vazirmatn-SemiBold.woff2 (600)
   ├── Vazirmatn-Bold.woff2 (700)
   ├── Vazirmatn-ExtraBold.woff2 (800)
   └── Vazirmatn-Black.woff2 (900)
   ```

3. **Update index.css**
   Replace the Google Fonts import with local @font-face declarations:

   ```css
   /* Remove this line:
   @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;500;600;700;800;900&display=swap');
   */

   /* Add these @font-face declarations: */
   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 100;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Thin.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 300;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Light.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 400;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Regular.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 500;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Medium.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 600;
     font-display: swap;
     src: url('/fonts/Vazirmatn-SemiBold.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 700;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Bold.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 800;
     font-display: swap;
     src: url('/fonts/Vazirmatn-ExtraBold.woff2') format('woff2');
   }

   @font-face {
     font-family: 'Vazirmatn';
     font-style: normal;
     font-weight: 900;
     font-display: swap;
     src: url('/fonts/Vazirmatn-Black.woff2') format('woff2');
   }

   @tailwind base;
   @tailwind components;
   @tailwind utilities;

   body {
     font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
     background-color: #f8fafc;
   }
   ```

4. **Optimize Font Loading**
   - Use `font-display: swap` to prevent invisible text during load
   - Include fallback fonts in the font-family stack
   - Consider using `<link rel="preload">` in index.html for critical fonts:
   ```html
   <link rel="preload" href="/fonts/Vazirmatn-Regular.woff2" as="font" type="font/woff2" crossorigin>
   <link rel="preload" href="/fonts/Vazirmatn-Bold.woff2" as="font" type="font/woff2" crossorigin>
   ```

## Benefits of Self-Hosting

✅ **Privacy**: No user data sent to third parties
✅ **Performance**: Fonts served from same domain (no extra DNS lookup)
✅ **Reliability**: No dependency on external CDN
✅ **Offline Support**: Fonts work with service worker caching
✅ **GDPR Compliance**: No third-party data collection
✅ **Control**: Can optimize and subset fonts as needed

## File Size Considerations

WOFF2 format provides excellent compression:
- Each weight file: ~50-80KB
- Total for 8 weights: ~400-640KB
- One-time download, cached by browser
- Much smaller than images already in the app

## Testing After Implementation

1. Check Network tab - no requests to fonts.googleapis.com
2. Verify fonts load correctly in all weights
3. Test with DevTools network throttling
4. Confirm service worker caches fonts
5. Test offline functionality

## Alternative: Subset Fonts

If you want to reduce file size further, you can create subsets:
- Persian/Arabic characters only subset
- Reduced number of weights (keep 400, 700, 900 only)
- Use tools like `glyphhanger` or `fonttools` to create subsets

---

**Status**: Font directory created, awaiting font files download
**Priority**: Medium - Improves privacy and performance
**Effort**: Low - Simple file placement and CSS update
