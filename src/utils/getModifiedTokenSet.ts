import { ModifiedTokenSetProperty } from '@/figmaStorage';

export async function getModifiedTokenSet(): Promise<string[]> {
  try {
    const data = await ModifiedTokenSetProperty.read();
    if (data) {
      return data;
    }
  } catch (e) {
    console.error('error retrieving modifiedTokenSet', e);
  }

  return [];
}
