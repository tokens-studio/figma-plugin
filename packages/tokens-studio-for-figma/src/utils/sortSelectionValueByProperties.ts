import { Properties } from '@/constants/Properties';
import { SelectionValue } from '@/types';
import { convertToOrderObj } from './convertToOrderObj';

export function sortSelectionValueByProperties(value: SelectionValue) {
  const orderObj = convertToOrderObj(Properties);
  return Object.assign({}, ...Object.keys(value).sort((a, b) => orderObj[a as keyof typeof value] - orderObj[b as keyof typeof value])
    .map((x) => ({ [x]: value[x as keyof typeof value] })));
}
