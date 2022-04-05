import { TokenTypes } from '@/constants/TokenTypes';
import { SelectionValue } from './SelectionValue';

export interface SelectionGroup {
  category: TokenTypes;
  type: SelectionValue;
  value: string;
  nodes: string[];
}
