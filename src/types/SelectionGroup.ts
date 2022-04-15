import { TokenTypes } from '@/constants/TokenTypes';
import { NodeInfo } from './NodeInfo';
import { SelectionValue } from './SelectionValue';

export interface SelectionGroup {
  category: TokenTypes;
  type: SelectionValue;
  value: string;
  nodes: NodeInfo[];
}
