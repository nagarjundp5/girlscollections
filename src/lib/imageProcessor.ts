/**
 * Client-side utility functions for color extraction, HSL calculations, 
 * and canvas compositing with soft drop-shadows.
 */

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a?: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Extract the dominant color from a transparent image by sampling pixels
 * that are non-transparent (alpha > 200).
 */
export function getDominantColor(imgElement: HTMLImageElement): RGBA {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return { r: 34, g: 34, b: 34 }; // default graphite #222222

  // Use a small canvas size to speed up pixel analysis
  canvas.width = 64;
  canvas.height = 64;
  ctx.drawImage(imgElement, 0, 0, 64, 64);

  try {
    const imgData = ctx.getImageData(0, 0, 64, 64).data;
    const colorMap: Record<string, number> = {};

    for (let i = 0; i < imgData.length; i += 4) {
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      // Ignore fully/semi-transparent pixels
      if (a < 200) continue;

      // Group/quantize color space by rounding to nearest multiple of 24
      const q = 24;
      const qr = Math.round(r / q) * q;
      const qg = Math.round(g / q) * q;
      const qb = Math.round(b / q) * q;
      const key = `${qr},${qg},${qb}`;

      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    let maxCount = 0;
    let dominantColor = { r: 34, g: 34, b: 34 };

    Object.entries(colorMap).forEach(([key, count]) => {
      if (count > maxCount) {
        maxCount = count;
        const [r, g, b] = key.split(',').map(Number);
        dominantColor = { r, g, b };
      }
    });

    return dominantColor;
  } catch (e) {
    console.error('Failed to analyze image pixels:', e);
    return { r: 34, g: 34, b: 34 };
  }
}

/**
 * Helper to convert RGB color to HSL
 */
export function rgbToHsl(r: number, g: number, b: number): HSL {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Renders the processed composite image with background and drop-shadow on a high-res canvas
 */
export function renderCompositeOnCanvas({
  canvas,
  cutoutImg,
  backgroundStyle,
  dominantColor,
}: {
  canvas: HTMLCanvasElement;
  cutoutImg: HTMLImageElement;
  backgroundStyle: 'neutral' | 'dark' | 'gradient';
  dominantColor: RGBA;
}): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  // 1. Draw background
  const hsl = rgbToHsl(dominantColor.r, dominantColor.g, dominantColor.b);

  if (backgroundStyle === 'neutral') {
    // complementary soft warm or cool desaturated tone
    ctx.fillStyle = `hsl(${hsl.h}, 10%, 93%)`;
    ctx.fillRect(0, 0, w, h);
  } else if (backgroundStyle === 'dark') {
    // standard premium charcoal dark tone #121212
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, w, h);
  } else if (backgroundStyle === 'gradient') {
    // soft studio lighting radial gradient
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 1.2);
    grad.addColorStop(0, `hsl(${hsl.h}, 15%, 88%)`);
    grad.addColorStop(1, `hsl(${hsl.h}, 8%, 70%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Calculate scaling and placement to fit the garment nicely inside 3:4 container
  const padding = w * 0.12; // 12% padding
  const maxW = w - padding * 2;
  const maxH = h - padding * 2;

  let drawW = cutoutImg.naturalWidth;
  let drawH = cutoutImg.naturalHeight;
  const ratio = Math.min(maxW / drawW, maxH / drawH);
  drawW *= ratio;
  drawH *= ratio;

  const drawX = (w - drawW) / 2;
  const drawY = (h - drawH) / 2;

  // 2. Draw Multi-Layer Drop Shadow
  ctx.save();
  // Layer 1: broad ambient occlusion shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
  ctx.shadowBlur = w * 0.08; // responsive blur
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = h * 0.03;
  ctx.drawImage(cutoutImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  ctx.save();
  // Layer 2: sharper contact shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.10)';
  ctx.shadowBlur = w * 0.02;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = h * 0.01;
  ctx.drawImage(cutoutImg, drawX, drawY, drawW, drawH);
  ctx.restore();

  // 3. Draw Cutout Layer
  ctx.drawImage(cutoutImg, drawX, drawY, drawW, drawH);
}
