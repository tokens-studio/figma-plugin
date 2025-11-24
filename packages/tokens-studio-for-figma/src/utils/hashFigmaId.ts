import crypto from 'crypto';

const secret = process.env.FIGMA_ID_HASH_SECRET || '';

export function hashFigmaUserId(userId: string): string {
  if (!secret) {
    throw new Error('Missing FIGMA_ID_HASH_SECRET');
  }
  return crypto.createHmac('sha256', secret).update(userId).digest('hex');
}
