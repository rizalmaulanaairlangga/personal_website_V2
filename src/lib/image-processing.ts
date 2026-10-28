import "server-only";

import sharp from "sharp";

export const MAX_CMS_IMAGE_BYTES = 10 * 1024 * 1024;
export const CMS_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_DIMENSION = 2400;

export interface CompressedCmsImage {
  bytes: Uint8Array;
  fileName: string;
  mimeType: "image/webp";
  originalSize: number;
  size: number;
}

export class InvalidCmsImageError extends Error {}

const safeBaseName = (name: string) => {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  const safe = withoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  return safe || "image";
};

export async function compressCmsImage(file: File): Promise<CompressedCmsImage> {
  if (!CMS_IMAGE_TYPES.has(file.type)) {
    throw new InvalidCmsImageError("Unsupported image format. Use PNG, JPEG, WebP, or GIF.");
  }
  if (file.size > MAX_CMS_IMAGE_BYTES) {
    throw new InvalidCmsImageError("File too large. Maximum size is 10 MB.");
  }

  const input = Buffer.from(await file.arrayBuffer());

  try {
    const { data, info } = await sharp(input, {
      animated: file.type === "image/gif",
    })
      .rotate()
      .resize({
        width: MAX_IMAGE_DIMENSION,
        height: MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, alphaQuality: 90, effort: 4 })
      .toBuffer({ resolveWithObject: true });

    return {
      bytes: new Uint8Array(data),
      fileName: `${safeBaseName(file.name)}.webp`,
      mimeType: "image/webp",
      originalSize: file.size,
      size: info.size,
    };
  } catch {
    throw new InvalidCmsImageError("Could not process this image. Choose a valid image file.");
  }
}
