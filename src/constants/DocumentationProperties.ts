import { PropertyObject } from '@/types/properties';
import { Properties } from './Properties';

export const DocumentationProperties: PropertyObject[] = [
  {
    label: 'Name',
    name: Properties.tokenName,
    clear: [Properties.tokenValue, Properties.value, Properties.description],
  },
  {
    label: 'Raw value',
    name: Properties.tokenValue,
    clear: [Properties.tokenName, Properties.value, Properties.description],
  },
  {
    label: 'Value',
    name: Properties.value,
    clear: [Properties.tokenName, Properties.tokenValue, Properties.description],
  },
  {
    label: 'Description',
    name: Properties.description,
    clear: [Properties.tokenName, Properties.tokenValue, Properties.value],
  },
];
