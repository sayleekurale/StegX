export interface ImageAnalysis {
  score: number;
  factors: {
    resolution: number;
    colorVariance: number;
    noiseLevel: number;
    aspectRatio: number;
  };
  recommendation: string;
}

function calculateColorVariance(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const pixelCount = width * height;
  
  // Calculate mean RGB values
  let rMean = 0, gMean = 0, bMean = 0;
  for (let i = 0; i < data.length; i += 4) {
    rMean += data[i];
    gMean += data[i + 1];
    bMean += data[i + 2];
  }
  rMean /= pixelCount;
  gMean /= pixelCount;
  bMean /= pixelCount;
  
  // Calculate variance
  let rVariance = 0, gVariance = 0, bVariance = 0;
  for (let i = 0; i < data.length; i += 4) {
    rVariance += Math.pow(data[i] - rMean, 2);
    gVariance += Math.pow(data[i + 1] - gMean, 2);
    bVariance += Math.pow(data[i + 2] - bMean, 2);
  }
  
  const totalVariance = (rVariance + gVariance + bVariance) / (3 * pixelCount);
  return Math.min(totalVariance / 10000, 1); // Normalize to 0-1
}

function calculateNoiseLevel(imageData: ImageData): number {
  const { data, width, height } = imageData;
  let edgeCount = 0;
  const threshold = 30;
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const current = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      
      // Check adjacent pixels
      const right = ((data[idx + 4] + data[idx + 5] + data[idx + 6]) / 3);
      const bottom = ((data[((y + 1) * width + x) * 4] + data[((y + 1) * width + x) * 4 + 1] + data[((y + 1) * width + x) * 4 + 2]) / 3);
      
      if (Math.abs(current - right) > threshold || Math.abs(current - bottom) > threshold) {
        edgeCount++;
      }
    }
  }
  
  return Math.min(edgeCount / (width * height * 0.1), 1);
}

export async function analyzeImageSuitability(file: File): Promise<ImageAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      
      // Calculate factors
      const resolution = Math.min((img.width * img.height) / 1000000, 1); // Normalize by 1MP
      const colorVariance = calculateColorVariance(imageData);
      const noiseLevel = calculateNoiseLevel(imageData);
      const aspectRatio = Math.min(Math.max(img.width / img.height, img.height / img.width) / 3, 1);
      
      // Calculate overall score (0-100)
      const score = Math.round(
        (resolution * 25) + 
        (colorVariance * 30) + 
        (noiseLevel * 25) + 
        (aspectRatio * 20)
      );
      
      // Generate recommendation
      let recommendation = '';
      if (score >= 80) {
        recommendation = 'Excellent for steganography! High color variance and good resolution.';
      } else if (score >= 60) {
        recommendation = 'Good choice. Some minor limitations but should work well.';
      } else if (score >= 40) {
        recommendation = 'Acceptable but may have limited capacity or detectability issues.';
      } else {
        recommendation = 'Not recommended. Low color variance or resolution may affect hiding capacity.';
      }
      
      resolve({
        score,
        factors: {
          resolution: Math.round(resolution * 100),
          colorVariance: Math.round(colorVariance * 100),
          noiseLevel: Math.round(noiseLevel * 100),
          aspectRatio: Math.round(aspectRatio * 100)
        },
        recommendation
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}