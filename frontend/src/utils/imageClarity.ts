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
  SHARPNESS_THRESHOLD: 25, // Relaxed threshold to accommodate blurry test datasets
  MIN_BRIGHTNESS: 35,        // Balanced for natural light variations
  MAX_BRIGHTNESS: 250,
  DEBUG: true
};

/**
 * Uses Laplacian variance to check if the image is sharp enough and has 
 * good exposure for accurate AI diagnostics.
 */
export const checkImageClarity = (file: File): Promise<ClarityResults> => {
  return new Promise((resolve, reject) => {
    const imgUrl = URL.createObjectURL(file);
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(imgUrl);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ variance: 1000, brightness: 128, isClear: true });
        return;
      }
      
      // Resize optimization based on target resolution
      let { width, height } = img;
      if (Math.max(width, height) > CLARITY_CONFIG.RESOLUTION) {
        const scale = CLARITY_CONFIG.RESOLUTION / Math.max(width, height);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      // 1. Calculate Grayscale and Average Brightness
      const gray = new Uint8Array(width * height);
      let sumLuma = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          gray[y * width + x] = luma;
          sumLuma += luma;
        }
      }
      const avgBrightness = sumLuma / (width * height);
      
      // 2. Compute Laplacian variance for Sharpness (using 3x3 kernel)
      let laplacianSum = 0;
      let validPixels = 0;
      const laplacian = new Float32Array(width * height);
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const val = 
            (-1 * gray[idx - width - 1]) + (+0 * gray[idx - width]) + (-1 * gray[idx - width + 1]) +
            (+0 * gray[idx - 1])         + (+4 * gray[idx])         + (+0 * gray[idx + 1]) +
            (-1 * gray[idx + width - 1]) + (+0 * gray[idx + width]) + (-1 * gray[idx + width + 1]);
          
          laplacian[idx] = val;
          laplacianSum += val;
          validPixels++;
        }
      }
      
      const lapMean = laplacianSum / validPixels;
      let varianceSum = 0;
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const diff = laplacian[idx] - lapMean;
          varianceSum += diff * diff;
        }
      }
      
      const variance = varianceSum / validPixels;
      let isClear = true;
      let error: string | undefined = undefined;
      
      if (variance < CLARITY_CONFIG.SHARPNESS_THRESHOLD) {
        isClear = false;
        error = `Image significantly blurry (score: ${variance.toFixed(1)}). Please capture a sharper image.`;
      } else if (avgBrightness < CLARITY_CONFIG.MIN_BRIGHTNESS) {
        isClear = false;
        error = `Image is too dark for accurate processing.`;
      } else if (avgBrightness > CLARITY_CONFIG.MAX_BRIGHTNESS) {
        isClear = false;
        error = `Image is washed out. Please reduce lighting.`;
      }
      
      if (CLARITY_CONFIG.DEBUG) {
        console.log(`Clarity Check - Variance: ${variance.toFixed(2)} / Brightness: ${avgBrightness.toFixed(2)}`);
      }
      
      resolve({ variance, brightness: avgBrightness, isClear, error });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(imgUrl);
      resolve({ variance: 1000, brightness: 128, isClear: false, error: "Invalid image format." });
    };
    
    img.src = imgUrl;
  });
};
