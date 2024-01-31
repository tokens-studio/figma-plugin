import { Properties } from '@/constants/Properties';

export function isDocumentationType(type: Properties): boolean {
  return [Properties.tokenValue, Properties.value, Properties.tokenName, Properties.description].includes(type);
}
