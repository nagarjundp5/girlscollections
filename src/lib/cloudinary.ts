/**
 * Utility for generating Cloudinary CDN URLs with responsive transformations.
 * Operates purely via string manipulation (zero server CPU load).
 * Guarantees zero traffic hits Vercel /_next/image CDN.
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
  dpr?: string | number;
  blur?: number;
}

const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME ||
  'lt3ga2by';

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
 * Produces direct res.cloudinary.com URLs bypassing Vercel Image optimization.
 */
export function cl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  if (!publicIdOrUrl) return '';

  let width: number | undefined;
  let height: number | undefined;
  let ar: string | undefined;
  let quality: string = 'auto:good';
  let format: string = 'auto';
  let crop: string = 'limit'; // Safe default: never crops heads or edges
  let gravity: string | undefined;
  let dpr: string | number = 'auto';
  let blur: number | undefined;

  if (typeof options === 'number') {
    width = options;
  } else if (options && typeof options === 'object') {
    width = options.w ?? options.width;
    height = options.h ?? options.height;
    ar = options.ar ?? options.aspectRatio;
    if (options.q !== undefined || options.quality !== undefined) {
      quality = String(options.q ?? options.quality);
    }
    if (options.f || options.format) format = options.f || options.format || 'auto';
    if (options.c || options.crop) crop = (options.c || options.crop) as string;
    if (options.g || options.gravity) gravity = options.g || options.gravity;
    if (options.dpr !== undefined) dpr = options.dpr;
    if (options.blur !== undefined) blur = options.blur;
  }

  // Non-cloudinary external links (e.g. data URI or blob) pass through untouched
  if (
    publicIdOrUrl.startsWith('data:') ||
    publicIdOrUrl.startsWith('blob:') ||
    (publicIdOrUrl.startsWith('http') && !publicIdOrUrl.includes('res.cloudinary.com'))
  ) {
    return publicIdOrUrl;
  }

  const publicId = extractCloudinaryPublicId(publicIdOrUrl);
  if (!publicId) return publicIdOrUrl;

  const transformations: string[] = [`f_${format}`, `q_${quality}`];
  if (dpr) transformations.push(`dpr_${dpr}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (ar) transformations.push(`ar_${ar}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity && crop !== 'limit' && crop !== 'fit') transformations.push(`g_${gravity}`);
  if (blur) transformations.push(`e_blur:${blur}`);

  const transformStr = transformations.join(',');
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`;
}

/**
 * Backward compatibility alias for existing callers
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
  return cl(publicIdOrUrl, {
    w: 24,
    blur: 200,
    q: 15,
    f: 'webp',
  });
}

export function getBlurPlaceholderUrl(publicIdOrUrl: string): string {
  return clBlur(publicIdOrUrl);
}

/**
 * Pre-warm Cloudinary Edge Cache for hero/priority images
 */
export async function prewarmCloudinaryImage(url: string): Promise<boolean> {
  if (!url || !url.startsWith('https://res.cloudinary.com')) return false;
  try {
    const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
