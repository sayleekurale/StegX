import CryptoJS from 'crypto-js';

interface SecureMessage {
  message: string;
  created_at: number;
  expires_in: number;
  device_id?: string;
  one_time_hash?: string;
}

// Generate device fingerprint
export function getDeviceId(): string {
  let deviceId = localStorage.getItem('stegx_device_id');
  if (!deviceId) {
    deviceId = CryptoJS.lib.WordArray.random(16).toString();
    localStorage.setItem('stegx_device_id', deviceId);
  }
  return deviceId;
}

export async function encryptMessage(
  message: string, 
  passphrase: string, 
  expiresIn: number = 1800,
  bindToDevice: boolean = false
): Promise<Uint8Array> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Create secure message object
  const secureMessage: SecureMessage = {
    message,
    created_at: Date.now(),
    expires_in: expiresIn,
    one_time_hash: CryptoJS.lib.WordArray.random(8).toString()
  };
  
  if (bindToDevice) {
    secureMessage.device_id = getDeviceId();
  }
  
  const messageString = JSON.stringify(secureMessage);
  const key = await deriveKey(passphrase);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(messageString));
  const cipherBytes = new Uint8Array(cipher);
  const out = new Uint8Array(iv.length + cipherBytes.length);
  out.set(iv, 0);
  out.set(cipherBytes, iv.length);
  return out;
}

export async function decryptMessage(payload: Uint8Array, passphrase: string): Promise<string> {
  if (payload.length < 13) throw new Error("Invalid payload");
  const iv = payload.slice(0, 12);
  const data = payload.slice(12);
  const key = await deriveKey(passphrase);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  const dec = new TextDecoder();
  const messageString = dec.decode(plain);
  
  try {
    const secureMessage: SecureMessage = JSON.parse(messageString);
    
    // Check if message has expired
    const currentTime = Date.now();
    if (currentTime > secureMessage.created_at + secureMessage.expires_in * 1000) {
      throw new Error("Message has expired");
    }
    
    // Check device binding
    if (secureMessage.device_id && secureMessage.device_id !== getDeviceId()) {
      throw new Error("Message is bound to a different device");
    }
    
    // Check one-time use
    const oneTimeKey = `decoded_${secureMessage.one_time_hash}`;
    if (localStorage.getItem(oneTimeKey)) {
      throw new Error("This message has already been decoded and is now locked");
    }
    
    // Mark as used
    localStorage.setItem(oneTimeKey, 'true');
    
    return secureMessage.message;
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Fallback for old format messages
      return messageString;
    }
    throw e;
  }
}

async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(passphrase));
  return crypto.subtle.importKey("raw", hash, "AES-GCM", false, ["encrypt", "decrypt"]);
}
