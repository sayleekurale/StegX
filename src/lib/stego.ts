function getImageBitmapFromFile(file: File): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const bmp = await createImageBitmap(img);
        URL.revokeObjectURL(url);
        resolve(bmp);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

function getImageDataFromBitmap(bmp: ImageBitmap): ImageData {
  const canvas = document.createElement("canvas");
  canvas.width = bmp.width;
  canvas.height = bmp.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bmp, 0, 0);
  return ctx.getImageData(0, 0, bmp.width, bmp.height);
}

function putImageDataToBlob(id: ImageData): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = id.width;
  canvas.height = id.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.putImageData(id, 0, 0);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/png"));
}

function numberTo32BitsBE(n: number): number[] {
  return [
    (n >>> 24) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
  ];
}

function* bytesToBits(bytes: Uint8Array): Generator<number> {
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      yield (byte >> i) & 1;
    }
  }
}

function bitsToBytes(bits: number[]): Uint8Array {
  const out = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < out.length; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      const bit = bits[i * 8 + j] ?? 0;
      b = (b << 1) | (bit & 1);
    }
    out[i] = b;
  }
  return out;
}

export async function encodeStego(file: File, payload: Uint8Array): Promise<Blob> {
  const bmp = await getImageBitmapFromFile(file);
  const id = getImageDataFromBitmap(bmp);
  const channelsPerPixel = 3; // R, G, B only
  const capacityBits = id.width * id.height * channelsPerPixel;
  const header = new Uint8Array(numberTo32BitsBE(payload.length));
  const totalBits = (header.length + payload.length) * 8;
  if (totalBits > capacityBits) {
    throw new Error("Image too small for this message. Choose a larger image or shorter message.");
  }

  const bits = [...bytesToBits(header), ...bytesToBits(payload)];
  const data = id.data;
  let bitIndex = 0;

  for (let i = 0; i < data.length && bitIndex < bits.length; i += 4) {
    // R
    data[i] = (data[i] & 0xfe) | bits[bitIndex++];
    if (bitIndex >= bits.length) break;
    // G
    data[i + 1] = (data[i + 1] & 0xfe) | bits[bitIndex++];
    if (bitIndex >= bits.length) break;
    // B
    data[i + 2] = (data[i + 2] & 0xfe) | bits[bitIndex++];
    // skip alpha channel (i + 3)
  }

  return putImageDataToBlob(id);
}

export async function extractStego(file: File): Promise<Uint8Array> {
  const bmp = await getImageBitmapFromFile(file);
  const id = getImageDataFromBitmap(bmp);
  const data = id.data;

  // Collect all RGB LSBs sequentially to avoid channel alignment bugs
  const rgbBits: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    rgbBits.push(data[i] & 1);     // R
    rgbBits.push(data[i + 1] & 1); // G
    rgbBits.push(data[i + 2] & 1); // B
  }
  if (rgbBits.length < 32) throw new Error("Invalid stego header");

  const headerBits = rgbBits.slice(0, 32);
  const headerBytes = bitsToBytes(headerBits);
  const length = (headerBytes[0] << 24) | (headerBytes[1] << 16) | (headerBytes[2] << 8) | headerBytes[3];
  if (length <= 0) throw new Error("No hidden data found");

  const start = 32;
  const end = start + length * 8;
  if (end > rgbBits.length) throw new Error("Truncated hidden data");

  const payloadBits = rgbBits.slice(start, end);
  return bitsToBytes(payloadBits);
}

// Image-to-image steganography functions
export async function encodeImageStego(coverFile: File, hiddenFile: File): Promise<Blob> {
  // Convert hidden image to bytes
  const hiddenArrayBuffer = await hiddenFile.arrayBuffer();
  const hiddenBytes = new Uint8Array(hiddenArrayBuffer);
  
  // Add a header to identify image type
  const fileType = hiddenFile.type.split('/')[1] || 'png';
  const typeHeader = new TextEncoder().encode(fileType);
  const typeLength = new Uint8Array(numberTo32BitsBE(typeHeader.length));
  
  // Combine type info and image data
  const payload = new Uint8Array(typeLength.length + typeHeader.length + hiddenBytes.length);
  payload.set(typeLength, 0);
  payload.set(typeHeader, typeLength.length);
  payload.set(hiddenBytes, typeLength.length + typeHeader.length);
  
  return encodeStego(coverFile, payload);
}

export async function extractImageStego(file: File): Promise<{ blob: Blob; type: string }> {
  const extractedBytes = await extractStego(file);
  
  // Extract type length (first 4 bytes)
  const typeLengthBytes = extractedBytes.slice(0, 4);
  const typeLength = (typeLengthBytes[0] << 24) | (typeLengthBytes[1] << 16) | (typeLengthBytes[2] << 8) | typeLengthBytes[3];
  
  // Extract file type
  const typeBytes = extractedBytes.slice(4, 4 + typeLength);
  const fileType = new TextDecoder().decode(typeBytes);
  
  // Extract image data
  const imageBytes = extractedBytes.slice(4 + typeLength);
  const blob = new Blob([imageBytes], { type: `image/${fileType}` });
  
  return { blob, type: fileType };
}
