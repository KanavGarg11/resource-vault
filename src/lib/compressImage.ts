import imageCompression from "browser-image-compression";

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  didCompress: boolean;
}

/**
 * Compresses an image file in the browser before network upload.
 * Reduces 5MB-10MB mobile phone photos down to ~200KB-600KB
 * while retaining crisp text for whiteboard notes, assignments, and documents.
 */
export async function compressImageIfNeeded(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  // Only process images (skip non-images like PDFs, ZIPs, docs)
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Preserve animations & vector graphics
  if (file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }

  // If already small (< 300KB), compression is not necessary
  if (file.size <= 300 * 1024) {
    return file;
  }

  try {
    const options = {
      maxSizeMB: 0.7, // Target around 700KB max
      maxWidthOrHeight: 1920, // 1080p/2K resolution keeps handwriting & code crystal clear
      useWebWorker: true,
      onProgress,
      fileType: file.type === "image/png" ? "image/jpeg" : file.type,
      initialQuality: 0.85,
    };

    const compressedBlob = await imageCompression(file, options);

    // Convert Blob back to File preserving original name
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });

    const originalKb = (file.size / 1024).toFixed(0);
    const compressedKb = (compressedFile.size / 1024).toFixed(0);
    console.log(
      `[LifeVault Compressor] Reduced image "${file.name}" from ${originalKb} KB to ${compressedKb} KB (${(
        (1 - compressedFile.size / file.size) *
        100
      ).toFixed(0)}% saved)`
    );

    return compressedFile;
  } catch (err) {
    console.warn("[LifeVault Compressor] Compression error, proceeding with original file:", err);
    return file;
  }
}
