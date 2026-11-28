/**
 * Utility for generating Cloudinary CDN URLs with responsive transformations.
 * Fixed widths only (400 / 800 / 1200) with f_auto,q_auto on every image URL.
 * Guarantees zero traffic hits Vercel /_next/image CDN (next/image has unoptimized: true).
 */
export interface CloudinaryUrlOptions {
  w?: number;
  width?: number;
  h?: number;
  height?: number;
  ar?: string; // e.g. '3:4', '1:1', '16:9'
  aspectRatio?: string;
  q?: string | number;
  quality?: string | number;
  f?: string;
  format?: string;
  c?: 'limit' | 'fill' | 'fit' | 'pad' | 'crop' | 'scale' | 'thumb';
  crop?: string;
  g?: string; // e.g. 'auto', 'face', 'subject'
  gravity?: string;
  b?: string; // e.g. 'auto', 'rgb:FAF8F5'
  background?: string;
  dpr?: string | number;
  blur?: number;
}

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  'lt3ga2by';

/**
 * Snap arbitrary requested widths to exactly 3 fixed widths (400 / 800 / 1200)
 * to strictly prevent transformation sprawl on Cloudinary Free Tier (25 credits/month).
 */
function snapToFixedWidth(requestedWidth?: number): number {
  if (requestedWidth === 600) {
    return 600; // Standard 3:4 card width (600x800)
  }
  if (!requestedWidth || requestedWidth <= 500) {
    return 400; // Small: Cards, thumbnails, related products
  }
  if (requestedWidth <= 950) {
    return 800; // Medium: Modal, tablet, list zoom
  }
  return 1200; // Large: PDP hero, desktop zoom
}

/**
 * Extract canonical public ID from a full Cloudinary URL or raw string
 */
export function extractCloudinaryPublicId(urlOrId: string): string {
  if (!urlOrId) return '';
  if (urlOrId.includes('res.cloudinary.com')) {
    const uploadIndex = urlOrId.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const pathAfterUpload = urlOrId.substring(uploadIndex + 8);
      const parts = pathAfterUpload.split('/');
      // Filter out version tags (v12345678) and transformation segments
      const cleanParts = parts.filter(
        (p) => !p.match(/^v\d+$/) && !p.includes(',') && !p.startsWith('c_') && !p.startsWith('w_')
      );
      return cleanParts.join('/');
    }
  }
  return urlOrId.replace(/^\//, '');
}

/**
 * Primary Cloudinary URL builder: cl(publicIdOrUrl, options)
 * Produces direct res.cloudinary.com URLs with f_auto,q_auto and fixed widths (400/800/1200).
 */
export function cl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  if (!publicIdOrUrl) return '';

  let rawWidth: number | undefined;
  let height: number | undefined;
  let ar: string | undefined;
  let crop: string = 'limit';
  let gravity: string | undefined;
  let background: string | undefined;
  let blur: number | undefined;

  if (typeof options === 'number') {
    rawWidth = options;
  } else if (options && typeof options === 'object') {
    rawWidth = options.w ?? options.width;
    height = options.h ?? options.height;
    ar = options.ar ?? options.aspectRatio;
    if (options.c || options.crop) crop = (options.c || options.crop) as string;
    if (options.g || options.gravity) gravity = options.g || options.gravity;
    if (options.b || options.background) background = options.b || options.background;
    if (options.blur !== undefined) blur = options.blur;
  }

  // Non-cloudinary external links pass through untouched
  if (
    publicIdOrUrl.startsWith('data:') ||
    publicIdOrUrl.startsWith('blob:') ||
    (publicIdOrUrl.startsWith('http') && !publicIdOrUrl.includes('res.cloudinary.com'))
  ) {
    return publicIdOrUrl;
  }

  const publicId = extractCloudinaryPublicId(publicIdOrUrl);
  if (!publicId) return publicIdOrUrl;

  // Strict Cloudinary Free Tier requirement: f_auto,q_auto on EVERY image URL
  const transformations: string[] = ['f_auto', 'q_auto'];

  // Fixed widths only: snap to 400, 800, or 1200
  const fixedWidth = snapToFixedWidth(rawWidth);
  transformations.push(`w_${fixedWidth}`);

  if (height) transformations.push(`h_${height}`);
  if (ar) transformations.push(`ar_${ar}`);
  if (crop) transformations.push(`c_${crop}`);
  if (background) transformations.push(`b_${background}`);
  if (gravity && crop !== 'limit' && crop !== 'fit' && crop !== 'pad') transformations.push(`g_${gravity}`);
  if (blur) transformations.push(`e_blur:${blur}`);

  const transformStr = transformations.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

export function clCard34(publicIdOrUrl: string): string {
  return cl(publicIdOrUrl, { w: 600, ar: '3:4', c: 'pad', b: 'auto' });
}

export function clCard(publicIdOrUrl: string): string {
  return cl(publicIdOrUrl, 400);
}

export function clHero(publicIdOrUrl: string): string {
  return cl(publicIdOrUrl, 1200);
}

export function clMedium(publicIdOrUrl: string): string {
  return cl(publicIdOrUrl, 800);
}

/**
 * Backward compatibility aliases for existing callers
 */
export function getCloudinaryUrl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  return cl(publicIdOrUrl, options);
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  return cl(publicIdOrUrl, options);
}

/**
 * Generates a tiny blurred placeholder URL for progressive Next.js blurDataURL
 */
export function clBlur(publicIdOrUrl: string): string {
  const publicId = extractCloudinaryPublicId(publicIdOrUrl);
  if (!publicId) return publicIdOrUrl;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,w_24,e_blur:200/${publicId}`;
}

export function getBlurPlaceholderUrl(publicIdOrUrl: string): string {
  return clBlur(publicIdOrUrl);
}
