const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ensure the assets directory exists
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// Convert SVG to PNG
sharp(path.join(assetsDir, 'icon.svg'))
    .resize(256, 256)
    .toFile(path.join(assetsDir, 'icon.png'))
    .then(() => console.log('Generated icon.png'))
    .catch(err => console.error('Error generating icon.png:', err));

// Convert SVG to ICO (Windows)
sharp(path.join(assetsDir, 'icon.svg'))
    .resize(256, 256)
    .toFormat('ico')
    .toFile(path.join(assetsDir, 'icon.ico'))
    .then(() => console.log('Generated icon.ico'))
    .catch(err => console.error('Error generating icon.ico:', err));

// Convert SVG to ICNS (Mac)
sharp(path.join(assetsDir, 'icon.svg'))
    .resize(256, 256)
    .toFormat('icns')
    .toFile(path.join(assetsDir, 'icon.icns'))
    .then(() => console.log('Generated icon.icns'))
    .catch(err => console.error('Error generating icon.icns:', err)); 