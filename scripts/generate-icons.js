#!/usr/bin/env node
// Generates all PWA icon PNGs from an inline SVG using sharp.
// Run: node scripts/generate-icons.js

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(OUT_DIR, { recursive: true });

// --- SVG design ---------------------------------------------------------
// Deep navy-to-green gradient background (football pitch vibe), bold soccer
// ball with classic pentagon patches, and "WC26" label at the bottom.
// Everything is in a 512x512 viewBox; sharp handles the resize.
function buildSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0d1b3e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a4d2e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="pitchLine" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ffffff;stop-opacity:0.06" />
      <stop offset="100%" style="stop-color:#ffffff;stop-opacity:0" />
    </linearGradient>
    <radialGradient id="ballShade" cx="38%" cy="32%" r="60%" fx="38%" fy="32%">
      <stop offset="0%"   style="stop-color:#ffffff;stop-opacity:0.9" />
      <stop offset="70%"  style="stop-color:#e8e8e8;stop-opacity:0.5" />
      <stop offset="100%" style="stop-color:#b0b0b0;stop-opacity:0.8" />
    </radialGradient>
  </defs>

  <!-- Background (edge-to-edge; OS clips to squircle / circle) -->
  <rect width="512" height="512" fill="url(#bg)" />

  <!-- Subtle pitch line hints -->
  <circle cx="256" cy="218" r="175" fill="none" stroke="url(#pitchLine)" stroke-width="2.5" />
  <line x1="0" y1="218" x2="512" y2="218" stroke="url(#pitchLine)" stroke-width="2" />

  <!-- Soccer ball — white sphere -->
  <circle cx="256" cy="210" r="150" fill="#f2f2f2" />
  <circle cx="256" cy="210" r="150" fill="url(#ballShade)" />

  <!-- Classic black pentagon patches -->
  <!-- Top center -->
  <polygon points="256,92 298,121 282,168 230,168 214,121" fill="#1a1a1a" />
  <!-- Upper-left -->
  <polygon points="148,168 192,144 214,168 208,214 160,226" fill="#1a1a1a" />
  <!-- Upper-right -->
  <polygon points="364,168 320,144 304,168 312,214 360,226" fill="#1a1a1a" />
  <!-- Lower-left -->
  <polygon points="174,280 208,214 256,228 256,276 212,302" fill="#1a1a1a" />
  <!-- Lower-right -->
  <polygon points="338,280 304,214 256,228 256,276 300,302" fill="#1a1a1a" />

  <!-- Specular highlight -->
  <ellipse cx="208" cy="162" rx="40" ry="26" fill="white" opacity="0.20" transform="rotate(-30 208 162)" />

  <!-- "WC26" label -->
  <text
    x="256"
    y="420"
    text-anchor="middle"
    font-family="'Arial Black','Arial',sans-serif"
    font-weight="900"
    font-size="78"
    letter-spacing="5"
    fill="white"
    opacity="0.95"
  >WC26</text>

  <!-- Gold accent underline -->
  <line x1="132" y1="436" x2="380" y2="436" stroke="#f0c040" stroke-width="4.5" stroke-linecap="round" opacity="0.80" />
</svg>`;
}

const SIZES = [
  { name: 'icon-512.png',         size: 512 },
  { name: 'icon-192.png',         size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-32.png',          size: 32  },
  { name: 'icon-16.png',          size: 16  },
];

async function generate() {
  const svgBuf = Buffer.from(buildSvg());

  for (const { name, size } of SIZES) {
    const outPath = path.join(OUT_DIR, name);
    await sharp(svgBuf)
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ ${name}  (${size}x${size})`);
  }

  // Copy 32px icon to public root as favicon.png fallback
  const favicon32 = path.join(OUT_DIR, 'icon-32.png');
  const faviconDest = path.join(__dirname, '..', 'public', 'favicon.png');
  fs.copyFileSync(favicon32, faviconDest);
  console.log('✓ favicon.png  (public root)');

  console.log('\nAll icons written to public/icons/');
}

generate().catch(err => { console.error(err); process.exit(1); });
