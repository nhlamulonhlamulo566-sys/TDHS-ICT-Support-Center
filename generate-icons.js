const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG to convert to PNG
const svg = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#2E3192"/>
  <circle cx="256" cy="256" r="200" fill="#4A5FFF"/>
  <text x="256" y="300" font-size="120" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial">TDHS</text>
</svg>
`;

// Generate 192x192 icon
sharp(Buffer.from(svg))
  .resize(192, 192)
  .png()
  .toFile(path.join(iconsDir, 'icon-192x192.png'))
  .then(() => console.log('✓ Generated icon-192x192.png'))
  .catch(err => console.error('Error generating 192x192 icon:', err));

// Generate 512x512 icon
sharp(Buffer.from(svg))
  .resize(512, 512)
  .png()
  .toFile(path.join(iconsDir, 'icon-512x512.png'))
  .then(() => console.log('✓ Generated icon-512x512.png'))
  .catch(err => console.error('Error generating 512x512 icon:', err));
