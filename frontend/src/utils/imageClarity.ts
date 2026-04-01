/**
 * Image Clarity Utilities
 * Includes Laplacian Variance analysis for sharpness and brightness validation.
 */

export interface ClarityResults {
  variance: number;
  brightness: number;
  isClear: boolean;
  error?: string;
}

const CLARITY_CONFIG = {
  RESOLUTION: 512,
  SHARPNESS_THRESHOLD: 300, // Balanced threshold to prevent false positives
  MIN_BRIGHTNESS: 40,
  MAX_BRIGHTNESS: 240,
};

/**
 * Uses Laplacian variance to check if the image is sharp enough and has 
 * good exposure for accurate AI diagnostics.
 */
export const checkImageClarity = async (file: File): Promise<ClarityResults> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      
      if (!ctx) {
        resolve({ variance: 0, brightness: 128, isClear: false, error: "Canvas context failed" });
        return;
      }

      // Resize for accurate analysis - higher resolution detects fine-grained blur
      const width = CLARITY_CONFIG.RESOLUTION;
      const height = (img.height / img.width) * width;
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const gray = new Float32Array(width * height);
      
      // Convert to Grayscale
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
        const val = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
        gray[i / 4] = val;
        totalBrightness += val;
      }
      
      const avgBrightness = totalBrightness / (width * height);

      // Simple 3x3 Laplacian Kernel analysis
      let laplacianSum = 0;
      let laplacianSqSum = 0;
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const val = -4 * gray[idx] + gray[idx - 1] + gray[idx + 1] + gray[idx - width] + gray[idx + width];
          laplacianSum += val;
          laplacianSqSum += val * val;
        }
      }

      const count = (width - 2) * (height - 2);
      const variance = (laplacianSqSum / count) - Math.pow(laplacianSum / count, 2);
      
      // Validation Logic
      let error = undefined;
      const isSharp = variance >= CLARITY_CONFIG.SHARPNESS_THRESHOLD;
      const isExposed = avgBrightness >= CLARITY_CONFIG.MIN_BRIGHTNESS && avgBrightness <= CLARITY_CONFIG.MAX_BRIGHTNESS;

      if (!isSharp) {
        error = "Image is too blurry. Please ensure the leaf is in sharp focus.";
      } else if (!isExposed) {
        error = avgBrightness < CLARITY_CONFIG.MIN_BRIGHTNESS 
          ? "Image is too dark. Please use better lighting." 
          : "Image is overexposed. Please capture a natural-light shot.";
      }

      // Clean up the URL object to prevent memory leaks
      URL.revokeObjectURL(img.src);

      resolve({
        variance,
        brightness: avgBrightness,
        isClear: isSharp && isExposed,
        error
      });
    };

    img.onerror = () => {
      resolve({ variance: 0, brightness: 0, isClear: false, error: "Failed to load image for check" });
    };
  });
};
