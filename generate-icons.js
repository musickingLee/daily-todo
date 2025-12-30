import sharp from 'sharp';
import fs from 'fs';

const svg = fs.readFileSync('./public/pwa-192x192.svg');

// Generate 192x192
sharp(svg)
  .resize(192, 192)
  .png()
  .toFile('./public/pwa-192x192.png')
  .then(() => console.log('Created pwa-192x192.png'));

// Generate 512x512
sharp(svg)
  .resize(512, 512)
  .png()
  .toFile('./public/pwa-512x512.png')
  .then(() => console.log('Created pwa-512x512.png'));

// Generate apple touch icon
sharp(svg)
  .resize(180, 180)
  .png()
  .toFile('./public/apple-touch-icon.png')
  .then(() => console.log('Created apple-touch-icon.png'));

// Generate favicon
sharp(svg)
  .resize(32, 32)
  .png()
  .toFile('./public/favicon.ico')
  .then(() => console.log('Created favicon.ico'));
