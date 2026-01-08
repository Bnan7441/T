const fs = require('fs');
const https = require('https');
const path = require('path');

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
         // Follow redirect
         download(response.headers.location, dest).then(resolve).catch(reject);
         return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(() => {
            console.log(`Downloaded: ${dest}`);
            resolve();
        });
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      console.error(`Error downloading ${url}:`, err.message);
      reject(err);
    });
  });
};

const assets = [
  // Hero Images
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop', dest: 'tondino-frontend/public/images/hero/hero-1.jpg' },
  { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop', dest: 'tondino-frontend/public/images/hero/hero-2.jpg' },
  { url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1000&auto=format&fit=crop', dest: 'tondino-frontend/public/images/hero/hero-3.jpg' },
  { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop', dest: 'tondino-frontend/public/images/hero/hero-4.jpg' },
  
  // Course Images
  { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80', dest: 'tondino-frontend/public/images/courses/react.jpg' },
  { url: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&q=80', dest: 'tondino-frontend/public/images/courses/uiux.jpg' },
  { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', dest: 'tondino-frontend/public/images/courses/python.jpg' },
  { url: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?w=800&q=80', dest: 'tondino-frontend/public/images/courses/marketing.jpg' },

  // Icons (Using placehold.co for valid PNGs)
  { url: 'https://placehold.co/152x152/3B82F6/FFFFFF.png?text=T', dest: 'tondino-frontend/public/icons/icon-152x152.png' },
  { url: 'https://placehold.co/192x192/3B82F6/FFFFFF.png?text=T', dest: 'tondino-frontend/public/icons/icon-192x192.png' },
  { url: 'https://placehold.co/512x512/3B82F6/FFFFFF.png?text=T', dest: 'tondino-frontend/public/icons/icon-512x512.png' },
  { url: 'https://placehold.co/180x180/3B82F6/FFFFFF.png?text=T', dest: 'tondino-frontend/public/icons/icon-180x180.png' },
  { url: 'https://placehold.co/167x167/3B82F6/FFFFFF.png?text=T', dest: 'tondino-frontend/public/icons/icon-167x167.png' }
];

const run = async () => {
  for (const asset of assets) {
    try {
      await download(asset.url, asset.dest);
    } catch (e) {
      console.error(`Failed ${asset.dest}`);
    }
  }
};

run();
