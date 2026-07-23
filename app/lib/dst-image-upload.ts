const MAX_DIMENSION = 1_600;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PreparedChatImage = {
  blob: Blob;
  previewUrl: string;
  alt: string;
  originalName: string;
};

type LoadedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

async function loadImage(file: File): Promise<LoadedImage> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      release: () => bitmap.close(),
    };
  }

  const sourceUrl = URL.createObjectURL(file);
  const image = new Image();
  image.decoding = "async";
  image.src = sourceUrl;
  try {
    await image.decode();
  } catch {
    URL.revokeObjectURL(sourceUrl);
    throw new Error("IMAGE_DECODE_FAILED");
  }
  return {
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    release: () => URL.revokeObjectURL(sourceUrl),
  };
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/jpeg" | "image/webp",
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mimeType, quality));
}

export async function prepareChatImage(file: File): Promise<PreparedChatImage> {
  if (!ACCEPTED_TYPES.has(file.type) || file.size === 0) {
    throw new Error("UNSUPPORTED_IMAGE");
  }
  if (file.size > MAX_SOURCE_BYTES) throw new Error("SOURCE_IMAGE_TOO_LARGE");

  const loaded = await loadImage(file);
  try {
    if (!loaded.width || !loaded.height) throw new Error("IMAGE_DECODE_FAILED");
    const initialScale = Math.min(1, MAX_DIMENSION / Math.max(loaded.width, loaded.height));
    let width = Math.max(1, Math.round(loaded.width * initialScale));
    let height = Math.max(1, Math.round(loaded.height * initialScale));

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("IMAGE_PROCESSING_FAILED");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      context.drawImage(loaded.source, 0, 0, width, height);

      const quality = Math.max(0.58, 0.88 - attempt * 0.08);
      let blob = await canvasBlob(canvas, "image/webp", quality);
      if (!blob || blob.type !== "image/webp") {
        blob = await canvasBlob(canvas, "image/jpeg", quality);
      }
      if (blob && blob.size > 0 && blob.size <= MAX_OUTPUT_BYTES) {
        return {
          blob,
          previewUrl: URL.createObjectURL(blob),
          alt: "Ảnh khách hàng đã chọn",
          originalName: file.name.slice(0, 120),
        };
      }
      width = Math.max(320, Math.round(width * 0.8));
      height = Math.max(320, Math.round(height * 0.8));
    }
    throw new Error("PROCESSED_IMAGE_TOO_LARGE");
  } finally {
    loaded.release();
  }
}
