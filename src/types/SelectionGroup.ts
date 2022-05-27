import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { NodeInfo } from './NodeInfo';

export interface SelectionGroup {
  category: TokenTypes | Properties;
  type: string;
  value: string;
  nodes: NodeInfo[];
}
