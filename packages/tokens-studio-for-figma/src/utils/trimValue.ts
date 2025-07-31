import { SingleToken } from '@/types/tokens';

export default function trimValue(value: SingleToken['value']): SingleToken['value'] {
  if (Array.isArray(value)) {
    return value.map((item) => (
      Object.entries(item).reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = value.toString().trim();
        return acc;
      }, {})
    )) as SingleToken['value'];
  } if (typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = value.toString().trim();
      return acc;
    }, {});
  }
  return value.toString().trim();
}
