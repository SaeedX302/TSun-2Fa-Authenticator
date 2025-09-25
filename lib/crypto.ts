// lib/crypto.ts

const encryptionKey = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-secret-key-that-is-very-long';

interface AccountConfig {
  secret: string;
  type?: 'totp' | 'hotp';
  algorithm?: 'SHA1' | 'SHA256' | 'SHA512';
  digits?: 6 | 7 | 8;
  period?: 30 | 60;
}

// Function to encrypt the entire config object
export function encryptConfig(config: AccountConfig): string {
    const jsonString = JSON.stringify(config);
    let encrypted = '';
    for (let i = 0; i < jsonString.length; i++) {
        encrypted += String.fromCharCode(jsonString.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length));
    }
    return btoa(encrypted);
}

// Function to decrypt the config object
export function decryptConfig(encryptedData: string): AccountConfig {
    const decoded = atob(encryptedData);
    let decrypted = '';
    for (let i = 0; i < decoded.length; i++) {
        decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ encryptionKey.charCodeAt(i % encryptionKey.length));
    }
    try {
        return JSON.parse(decrypted);
    } catch (e) {
        // Fallback for old single-string secrets
        return { secret: decrypted };
    }
}
