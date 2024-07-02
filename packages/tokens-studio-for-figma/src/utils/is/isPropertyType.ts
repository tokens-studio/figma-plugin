import { Properties } from '@/constants/Properties';

export function isPropertyType(input: string | Properties): input is Properties {
  return Object.values<string>(Properties).includes(input);
}
