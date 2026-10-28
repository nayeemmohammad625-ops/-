import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to generate an uncompressed PNG buffer using zlib
function createPng(width: number, height: number, rgbaGenerator: (x: number, y: number) => [number, number, number, number]): Buffer {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel;
  const rawData = Buffer.alloc((scanlineLength + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (scanlineLength + 1);
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = rgbaGenerator(x, y);
      const pixelOffset = rowOffset + 1 + x * bytesPerPixel;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper for CRC32
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }

  function crc32(buf: Buffer): number {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function createChunk(type: string, data: Buffer): Buffer {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const typeAndData = Buffer.concat([typeBuf, data]);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate stylized Rickshaw Rush themed icon
function rickshawIconPixel(x: number, y: number, size: number, isMaskable = false): [number, number, number, number] {
  const nx = x / size;
  const ny = y / size;
  const cx = 0.5;
  const cy = 0.5;
  const dist = Math.sqrt((nx - cx) * (nx - cx) + (ny - cy) * (ny - cy));

  // Background: Emerald gradient
  const bgR = Math.floor(6 + 10 * (1 - ny));
  const bgG = Math.floor(78 + 90 * (1 - ny));
  const bgB = Math.floor(59 + 40 * ny);

  if (!isMaskable && dist > 0.48) {
    // Transparent outside rounded boundaries
    return [0, 0, 0, 0];
  }

  // Golden wheel ring
  const wheelDist1 = Math.sqrt((nx - 0.38) * (nx - 0.38) + (ny - 0.68) * (ny - 0.68));
  if (wheelDist1 >= 0.11 && wheelDist1 <= 0.15) {
    return [253, 224, 71, 255]; // Golden rim
  }
  if (wheelDist1 < 0.11 && wheelDist1 >= 0.08) {
    return [30, 41, 59, 255]; // Dark tire
  }
  if (wheelDist1 < 0.035) {
    return [245, 158, 11, 255]; // Hub
  }

  const wheelDist2 = Math.sqrt((nx - 0.76) * (nx - 0.76) + (ny - 0.68) * (ny - 0.68));
  if (wheelDist2 >= 0.09 && wheelDist2 <= 0.12) {
    return [253, 224, 71, 255]; // Golden rim front
  }
  if (wheelDist2 < 0.09 && wheelDist2 >= 0.065) {
    return [30, 41, 59, 255]; // Dark tire
  }
  if (wheelDist2 < 0.03) {
    return [245, 158, 11, 255]; // Hub
  }

  // Hood / Canopy
  const hoodDist = Math.sqrt((nx - 0.45) * (nx - 0.45) + (ny - 0.38) * (ny - 0.38));
  if (hoodDist < 0.22 && nx < 0.65 && ny < 0.55) {
    // Red / Yellow folk art stripes
    const stripe = Math.sin((nx + ny) * 25);
    if (stripe > 0.2) return [239, 68, 68, 255]; // Crimson
    if (stripe > -0.2) return [245, 158, 11, 255]; // Yellow
    return [236, 72, 153, 255]; // Pink folk art
  }

  // Frame chassis
  if (ny >= 0.58 && ny <= 0.61 && nx >= 0.35 && nx <= 0.75) {
    return [52, 211, 153, 255];
  }

  // Bell shine
  const bellDist = Math.sqrt((nx - 0.72) * (nx - 0.72) + (ny - 0.42) * (ny - 0.42));
  if (bellDist < 0.03) {
    return [254, 240, 138, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
const buf192 = createPng(192, 192, (x, y) => rickshawIconPixel(x, y, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), buf192);

// 512x512
const buf512 = createPng(512, 512, (x, y) => rickshawIconPixel(x, y, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), buf512);

// Maskable 512x512
const bufMaskable = createPng(512, 512, (x, y) => rickshawIconPixel(x, y, 512, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), bufMaskable);

// Apple touch icon 180x180
const bufApple = createPng(180, 180, (x, y) => rickshawIconPixel(x, y, 180, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), bufApple);

// Favicon
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), buf192);

console.log('Successfully generated all PWA icons!');
