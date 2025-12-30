import crypto from 'crypto';

export function hashFigmaUserId(userId: string): string {
  const secret = process.env.FIGMA_ID_HASH_SECRET || '';
  if (!secret) {
    throw new Error('Missing FIGMA_ID_HASH_SECRET');
  }
  return crypto.createHmac('sha256', secret).update(userId).digest('hex');
}
