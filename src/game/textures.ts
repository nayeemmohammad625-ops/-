import * as THREE from 'three';

/**
 * Procedural Canvas Textures for 3D Rickshaw Rush
 * Enforces Three.js skill directives: SRGBColorSpace, zero external files, crisp textures.
 */

export function createRickshawHoodTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Background deep royal blue / teal
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#0284c7');
  grad.addColorStop(0.5, '#0369a1');
  grad.addColorStop(1, '#0c4a6e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Traditional Rickshaw Art Scalloped Borders
  ctx.fillStyle = '#f59e0b'; // golden yellow
  for (let i = 0; i < 512; i += 32) {
    ctx.beginPath();
    ctx.arc(i + 16, 20, 16, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(i + 16, 492, 16, Math.PI, 0);
    ctx.fill();
  }

  // Red and green decorative stripes
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 40, 512, 16);
  ctx.fillRect(0, 456, 512, 16);

  ctx.fillStyle = '#10b981';
  ctx.fillRect(0, 60, 512, 12);
  ctx.fillRect(0, 440, 512, 12);

  // Central Lotus / Floral Motif (প্রস্ফুটিত পদ্মফুল)
  const cx = 256;
  const cy = 256;

  // Center golden glow
  const sunGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 140);
  sunGrad.addColorStop(0, '#fef08a');
  sunGrad.addColorStop(0.6, '#f59e0b');
  sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 140, 0, Math.PI * 2);
  ctx.fill();

  // Lotus petals
  const petalColors = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af'];
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = petalColors[i % petalColors.length];
    ctx.beginPath();
    ctx.ellipse(0, -65, 24, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();
  }

  // Inner lotus core
  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(cx, cy, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Corner decorative flourishes
  const corners = [
    [60, 110],
    [452, 110],
    [60, 390],
    [452, 390],
  ];
  corners.forEach(([x, y]) => {
    ctx.fillStyle = '#e11d48';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHighwayRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle asphalt noise
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const shade = Math.random() > 0.5 ? 45 : 20;
    ctx.fillStyle = `rgb(${shade}, ${shade + 4}, ${shade + 8})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Double Yellow center line
  ctx.fillStyle = '#eab308';
  ctx.fillRect(250, 0, 5, 512);
  ctx.fillRect(258, 0, 5, 512);

  // White lane dashes
  ctx.fillStyle = '#f8fafc';
  for (let y = 10; y < 512; y += 48) {
    ctx.fillRect(128, y, 4, 28);
    ctx.fillRect(380, y, 4, 28);
  }

  // Road edge solid lines
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(16, 0, 6, 512);
  ctx.fillRect(490, 0, 6, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createVillageRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm terracotta / red brick base (হেরিংবোন ইট বিছানো রাস্তা)
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(0, 0, 512, 512);

  // Brick pattern
  const bw = 32;
  const bh = 16;
  for (let y = 0; y < 512; y += bh) {
    const offsetX = (Math.floor(y / bh) % 2) * (bw / 2);
    for (let x = -bw; x < 512 + bw; x += bw) {
      const px = x + offsetX;
      // Slight brick color variation
      const r = 160 + Math.floor(Math.random() * 30);
      const g = 60 + Math.floor(Math.random() * 20);
      const b = 30 + Math.floor(Math.random() * 15);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(px + 1, y + 1, bw - 2, bh - 2);
    }
  }

  // Dirt & grass fringe on edges
  ctx.fillStyle = '#65a30d';
  for (let y = 0; y < 512; y += 8) {
    const w1 = 12 + Math.random() * 14;
    const w2 = 12 + Math.random() * 14;
    ctx.fillRect(0, y, w1, 8);
    ctx.fillRect(512 - w2, y, w2, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createShopSignTexture(textBn: string, textEn: string, bgColor = '#059669'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Border & background
  ctx.fillStyle = '#fde047'; // Golden yellow border
  ctx.fillRect(0, 0, 512, 128);

  ctx.fillStyle = bgColor;
  ctx.fillRect(8, 8, 496, 112);

  // Bengali text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(textBn, 256, 48);

  // English sub-text
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 18px "Outfit", sans-serif';
  ctx.fillText(textEn.toUpperCase(), 256, 92);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createHighwayGantryTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  // Gantry blue board
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(0, 0, 512, 160);

  // White border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 148);

  // Red restriction badge
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(60, 80, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Slash inside badge
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(35, 105);
  ctx.lineTo(85, 55);
  ctx.stroke();

  // Highway text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('হাই রোড — রিকসা চলাচল নিষেধ!', 120, 55);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 20px "Outfit", sans-serif';
  ctx.fillText('HIGHWAY — NO RICKSHAWS (FINE ৳)', 120, 105);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
