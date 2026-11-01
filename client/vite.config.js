import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function syncUserAssets() {
  const oldSrcDir = 'C:\\Users\\hario\\.gemini\\antigravity-ide\\brain\\61da740a-4119-4c70-961d-334eabc3a9cd\\.user_uploaded';
  const currSrcDir = 'C:\\Users\\hario\\.gemini\\antigravity-ide\\brain\\08395e18-9da5-4911-b9aa-2f9f7c4a1580\\.user_uploaded';
  const cardsDestDir = path.resolve(__dirname, 'public/assets/cards');
  const assetsDestDir = path.resolve(__dirname, 'public/assets');
  const vehiclesDestDir = path.resolve(__dirname, 'public/assets/vehicles');

  if (!fs.existsSync(cardsDestDir)) {
    fs.mkdirSync(cardsDestDir, { recursive: true });
  }
  if (!fs.existsSync(vehiclesDestDir)) {
    fs.mkdirSync(vehiclesDestDir, { recursive: true });
  }

  const copyList = [
    { dir: oldSrcDir, src: 'media_1793031003774.jpg', dest: path.join(cardsDestDir, 'card1.jpg') },
    { dir: oldSrcDir, src: 'media_1793031003774.jpg', dest: path.join(cardsDestDir, 'card1.png') },
    { dir: oldSrcDir, src: 'media_1793031031805.jpg', dest: path.join(cardsDestDir, 'card2.jpg') },
    { dir: oldSrcDir, src: 'media_1793031031829.jpg', dest: path.join(cardsDestDir, 'card3.jpg') },
    { dir: oldSrcDir, src: 'media_1793031031890.jpg', dest: path.join(cardsDestDir, 'card4.jpg') },
    { dir: oldSrcDir, src: 'media_1793031031906.jpg', dest: path.join(cardsDestDir, 'card5.jpg') },
    { dir: oldSrcDir, src: 'media_1793032073093.jpg', dest: path.join(cardsDestDir, 'card6.jpg') },
    { dir: oldSrcDir, src: 'media_1793032073093.jpg', dest: path.join(cardsDestDir, 'card6.png') },
    { dir: oldSrcDir, src: 'media_1793030483455.jpg', dest: path.join(assetsDestDir, 'air-dream-logo.jpg') },
    { dir: oldSrcDir, src: 'media_1793030483455.jpg', dest: path.join(assetsDestDir, 'air-dream-badge.jpg') },
    // 5 Airport Transfer vehicles uploaded by user
    { dir: currSrcDir, src: 'media_1793460306362.jpg', dest: path.join(vehiclesDestDir, 'toyota-hyryder.jpg') },
    { dir: currSrcDir, src: 'media_1793460306383.jpg', dest: path.join(vehiclesDestDir, 'toyota-fortuner.jpg') },
    { dir: currSrcDir, src: 'media_1793460306416.jpg', dest: path.join(vehiclesDestDir, 'toyota-land-cruiser.jpg') },
    { dir: currSrcDir, src: 'media_1793460306425.jpg', dest: path.join(vehiclesDestDir, 'toyota-alphard-vip.jpg') },
    { dir: currSrcDir, src: 'media_1793460306450.jpg', dest: path.join(vehiclesDestDir, 'toyota-corolla.jpg') }
  ];

  copyList.forEach(({ dir, src, dest }) => {
    const fullSrc = path.join(dir, src);
    try {
      if (fs.existsSync(fullSrc)) {
        fs.copyFileSync(fullSrc, dest);
        console.log(`[Vite Assets] Synced ${src} -> ${path.basename(dest)}`);
      }
    } catch (e) {
      console.warn(`[Vite Assets] Notice: Could not sync ${src}:`, e.message);
    }
  });
}

// Sync on configuration evaluation
try {
  syncUserAssets();
} catch (e) {
  // Ignore if path not found
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'sync-user-assets-plugin',
      buildStart() {
        syncUserAssets();
      }
    }
  ],
  server: {
    port: 5173,
    host: true
  }
});
