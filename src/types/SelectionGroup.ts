import { Properties } from '@/constants/Properties';
import { TokenTypes } from '@/constants/TokenTypes';
import { NodeInfo } from './NodeInfo';
import { SingleToken } from './tokens';

export interface SelectionGroup {
  category: TokenTypes | Properties;
  type: string;
  value: string;
  nodes: NodeInfo[];
  resolvedValue?: SingleToken['value'] // We save the value of the style
}
