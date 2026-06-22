import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; 
const ALGORITHM = 'aes-256-gcm';

export function encryptPassword(text: string) {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY muss exakt 32 Zeichen lang sein.');
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedPassword: encrypted + authTag,
    iv: iv.toString('hex')
  };
}

export function decryptPassword(encryptedPasswordWithTag: string, ivHex: string): string {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY muss exakt 32 Zeichen lang sein.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  
  const authTagOffset = encryptedPasswordWithTag.length - 32;
  const encryptedData = encryptedPasswordWithTag.slice(0, authTagOffset);
  const authTag = Buffer.from(encryptedPasswordWithTag.slice(authTagOffset), 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}