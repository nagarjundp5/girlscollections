/**
 * Utility for generating Cloudinary CDN URLs with responsive transformations.
 * Operates purely via string manipulation (zero server CPU load).
 */
export interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || 'lt3ga2by';

export function getCloudinaryUrl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  if (!publicIdOrUrl) return '';

  let width: number | undefined;
  let height: number | undefined;
  let quality = 'auto';
  let format = 'auto';
  let crop = 'limit';

  if (typeof options === 'number') {
    width = options;
  } else if (options && typeof options === 'object') {
    width = options.width;
    height = options.height;
    if (options.quality) quality = String(options.quality);
    if (options.format) format = options.format;
    if (options.crop) crop = options.crop;
  }

  // Extract publicId if a full Cloudinary URL is passed
  let publicId = publicIdOrUrl;
  if (publicIdOrUrl.includes('res.cloudinary.com')) {
    const uploadIndex = publicIdOrUrl.indexOf('/upload/');
    if (uploadIndex !== -1) {
      const pathAfterUpload = publicIdOrUrl.substring(uploadIndex + 8);
      const parts = pathAfterUpload.split('/');
      const cleanParts = parts.filter(p => !p.match(/^v\d+$/) && !p.includes(','));
      publicId = cleanParts.join('/');
    }
  }

  // If not a Cloudinary image (e.g. external http link or blob), return as is
  if (!publicId.includes('/') && !publicId.startsWith('tgc/')) {
    if (publicIdOrUrl.startsWith('http') || publicIdOrUrl.startsWith('blob:')) {
      return publicIdOrUrl;
    }
  }

  const transformations: string[] = [`f_${format}`, `q_${quality}`];
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (width || height) transformations.push(`c_${crop}`);

  const transformStr = transformations.join(',');
  const cleanId = publicId.replace(/^\//, '');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${cleanId}`;
}

export function getOptimizedImageUrl(
  publicIdOrUrl: string,
  options?: number | CloudinaryUrlOptions
): string {
  return getCloudinaryUrl(publicIdOrUrl, options);
}

export function getBlurPlaceholderUrl(publicIdOrUrl: string): string {
  return getCloudinaryUrl(publicIdOrUrl, { width: 30, quality: 30, format: 'webp' });
}
