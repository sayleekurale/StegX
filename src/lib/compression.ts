import * as pako from 'pako';

export interface CompressionResult {
  compressed: Uint8Array;
  originalSize: number;
  compressedSize: number;
  ratio: number;
}

export function compressMessage(message: string): CompressionResult {
  const encoder = new TextEncoder();
  const originalBytes = encoder.encode(message);
  const originalSize = originalBytes.length;
  
  // Use pako for gzip compression
  const compressed = pako.gzip(originalBytes);
  const compressedSize = compressed.length;
  
  const ratio = originalSize > 0 ? (compressedSize / originalSize) : 1;
  
  return {
    compressed,
    originalSize,
    compressedSize,
    ratio: Math.round(ratio * 100) / 100
  };
}

export function decompressMessage(compressed: Uint8Array): string {
  try {
    const decompressed = pako.gunzip(compressed);
    const decoder = new TextDecoder();
    return decoder.decode(decompressed);
  } catch (error) {
    // Fallback: try to decode as plain text
    const decoder = new TextDecoder();
    return decoder.decode(compressed);
  }
}

export function shouldCompress(message: string, threshold: number = 100): boolean {
  if (message.length < threshold) return false;
  
  // Test compression to see if it's beneficial
  const testResult = compressMessage(message);
  return testResult.ratio < 0.9; // Only compress if we save at least 10%
}

export function generateSummary(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  
  // Simple extractive summary - take first and last sentences up to max length
  const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 1) {
    return message.substring(0, maxLength - 3) + '...';
  }
  
  let summary = sentences[0].trim();
  
  // Add more sentences if space allows
  for (let i = 1; i < sentences.length; i++) {
    const nextSentence = sentences[i].trim();
    if (summary.length + nextSentence.length + 2 <= maxLength) {
      summary += '. ' + nextSentence;
    } else {
      break;
    }
  }
  
  return summary + (summary.length < message.length ? '...' : '');
}