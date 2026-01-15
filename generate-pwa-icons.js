const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create SVG with TDHS ICT branding - modern design
const svgIcon = `
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <!-- Background gradient -->
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2E3192;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1d5e;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Main background -->
  <rect width="512" height="512" fill="url(#grad)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="80" fill="#4A5FFF" opacity="0.2"/>
  <circle cx="412" cy="412" r="100" fill="#4A5FFF" opacity="0.15"/>
  
  <!-- Central content circle -->
  <circle cx="256" cy="256" r="180" fill="none" stroke="#4A5FFF" stroke-width="2" opacity="0.3"/>
  
  <!-- Tech icon: interconnected nodes -->
  <circle cx="220" cy="240" r="12" fill="#4A5FFF"/>
  <circle cx="280" cy="240" r="12" fill="#4A5FFF"/>
  <circle cx="250" cy="290" r="12" fill="#4A5FFF"/>
  
  <!-- Connection lines -->
  <line x1="220" y1="240" x2="280" y2="240" stroke="#4A5FFF" stroke-width="3" opacity="0.8"/>
  <line x1="220" y1="240" x2="250" y2="290" stroke="#4A5FFF" stroke-width="3" opacity="0.8"/>
  <line x1="280" y1="240" x2="250" y2="290" stroke="#4A5FFF" stroke-width="3" opacity="0.8"/>
  
  <!-- TDHS text -->
  <text x="256" y="340" font-size="48" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">TDHS</text>
  
  <!-- ICT Support text -->
  <text x="256" y="375" font-size="18" fill="#4A5FFF" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="2">ICT SUPPORT</text>
</svg>
`;

// Helper function to generate icons
async function generateIcon(size) {
  try {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`✓ Generated icon-${size}x${size}.png`);
  } catch (err) {
    console.error(`Error generating ${size}x${size} icon:`, err);
  }
}

// Generate all icon sizes
async function generateAllIcons() {
  const sizes = [192, 512, 384, 256, 128];
  
  for (const size of sizes) {
    await generateIcon(size);
  }
  
  console.log('All icons generated successfully!');
}

generateAllIcons();
