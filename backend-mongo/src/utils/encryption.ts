import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || process.env.ENCRYPTION_KEY || 'catchme-default-encryption-secret-key';
const IV_LENGTH = 16;

// Derive a 32-byte key using SHA-256 so that any key/secret format is supported securely.
const KEY = crypto.createHash('sha256').update(ENCRYPTION_SECRET).digest();

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  if (textParts.length < 2) {
    throw new Error('Invalid encrypted text format');
  }
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
