import { LastOpenedProperty } from '@/figmaStorage';

const FALLBACK_LAST_OPENED = 1616241985291;

export default async function getLastOpened(): Promise<number> {
  let data: number = FALLBACK_LAST_OPENED;
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await LastOpenedProperty.read() || FALLBACK_LAST_OPENED;
    await LastOpenedProperty.write(Date.now());
  } catch (e) {
    console.error('error retrieving lastOpened', e);
    await LastOpenedProperty.write(Date.now());
    data = FALLBACK_LAST_OPENED;
  }

  return data;
}
