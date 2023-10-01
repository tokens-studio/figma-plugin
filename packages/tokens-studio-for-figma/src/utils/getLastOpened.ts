import { LastOpenedProperty } from '@/figmaStorage';

export default async function getLastOpened(): Promise<number> {
  let data: number;
  try {
    // Set specific date as lastOpened if none existed (when we started the changelog)
    data = await LastOpenedProperty.read() || 0;
    await LastOpenedProperty.write(Date.now());
  } catch (e) {
    console.error('error retrieving lastOpened', e);
    await LastOpenedProperty.write(Date.now());
    data = 0;
  }

  return data;
}
