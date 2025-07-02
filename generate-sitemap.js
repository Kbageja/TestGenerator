// generate-sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hostname = 'https://testmaker-omega.vercel.app';
const sitemapStream = new SitemapStream({ hostname });
const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
const writeStream = createWriteStream(outputPath);

sitemapStream.pipe(writeStream);

// Static routes
sitemapStream.write({ url: '/', changefreq: 'daily', priority: 1.0 });
sitemapStream.write({ url: '/sign-in', changefreq: 'yearly', priority: 0.3 });
sitemapStream.write({ url: '/sign-up', changefreq: 'yearly', priority: 0.3 });
sitemapStream.write({ url: '/Dashboard', changefreq: 'weekly', priority: 0.9 });
sitemapStream.write({ url: '/CreateTest', changefreq: 'monthly', priority: 0.7 });
sitemapStream.write({ url: '/Tests', changefreq: 'weekly', priority: 0.8 });

sitemapStream.end();

// ✅ Await the sitemapStream (readable), not the writeStream
streamToPromise(sitemapStream).then(() => {
  console.log('✅ Sitemap generated at public/sitemap.xml');
});
