const sharp = require('sharp');
const path = require('path');

const src = path.join(process.env.USERPROFILE, 'OneDrive', 'Wc26', 'wc26-lockup-cyan.png');
const pub = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'apple-touch-icon-v2.png', size: 180 },
  { name: 'icon-192-v3.png', size: 192 },
  { name: 'icon-512-v3.png', size: 512 },
  { name: 'android-chrome-192x192.png', size: 192 },
  { name: 'android-chrome-512x512.png', size: 512 },
];

(async () => {
  for (const s of sizes) {
    await sharp(src)
      .resize(s.size, s.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toFile(path.join(pub, s.name));
    console.log('Generated', s.name);
  }
  console.log('Done!');
})();
