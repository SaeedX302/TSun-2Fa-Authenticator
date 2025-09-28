
// lib/crypto.ts
import { webcrypto } from 'crypto';

// Check if running in a browser or Node.js environment
const crypto = typeof window !== 'undefined' ? window.crypto : webcrypto;

interface AccountConfig {
  secret: string;
  type?: 'totp' | 'hotp';
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 7 | 8;
  period?: 30 | 60;
}

const KDF_ITERATIONS = 100000;
const SALT_LENGTH = 16; // 128 bits
const IV_LENGTH = 12;   // 96 bits for AES-GCM

// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64');
}

// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(b64: string): ArrayBuffer {
  return Buffer.from(b64, 'base64');
}

async function getKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: KDF_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Function to encrypt the entire config object
export async function encryptConfig(config: AccountConfig, password: string): Promise<string> {
  try {
    const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    
    const key = await getKey(password, salt);
    
    const jsonString = JSON.stringify(config);
    const enc = new TextEncoder();
    const encodedData = enc.encode(jsonString);

    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encodedData
    );

    const saltB64 = bufferToBase64(salt);
    const ivB64 = bufferToBase64(iv);
    const encryptedB64 = bufferToBase64(encryptedData);

    // Combine salt, iv, and data, separated by a colon
    return `${saltB64}:${ivB64}:${encryptedB64}`;
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Could not encrypt data.");
  }
}

// Function to decrypt the config object
export async function decryptConfig(encryptedPayload: string, password: string): Promise<AccountConfig> {
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      // Fallback for old, insecure data format for a short time
      return legacyDecryptConfig(encryptedPayload);
    }
    const [saltB64, ivB64, encryptedB64] = parts;

    const salt = base64ToBuffer(saltB64);
    const iv = base64ToBuffer(ivB64);
    const encryptedData = base64ToBuffer(encryptedB64);

    const key = await getKey(password, salt as Uint8Array);

    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as Uint8Array,
      },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    const decryptedString = dec.decode(decryptedData);
    
    const defaults = {
        type: 'totp' as 'totp' | 'hotp',
        algorithm: 'SHA1' as 'SHA1' | 'SHA256' | 'SHA512',
        digits: 6 as 6 | 7 | 8,
        period: 30 as 30 | 60,
    };

    const parsed = JSON.parse(decryptedString);
    return { ...defaults, ...parsed };
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Could not decrypt data. Invalid password or corrupted data.");
  }
}

// Insecure fallback for migrating old data.
function legacyDecryptConfig(encryptedData: string): AccountConfig {
    const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-secret-key-that-is-very-long';
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length));
    }

    const defaults = {
        type: 'totp' as 'totp' | 'hotp',
        algorithm: 'SHA1' as 'SHA1' | 'SHA256' | 'SHA512',
        digits: 6 as 6 | 7 | 8,
        period: 30 as 30 | 60,
    };

    try {
        const parsed = JSON.parse(decrypted);
        if (typeof parsed === 'object' && parsed !== null && parsed.secret) {
            return { ...defaults, ...parsed };
        }
        return { ...defaults, secret: String(parsed) };
    } catch (e) {
        return { ...defaults, secret: decrypted };
    }
}
