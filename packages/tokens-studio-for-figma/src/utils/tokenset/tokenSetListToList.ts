import { TreeItem } from './tokenSetListToTree';

export function tokenSetListToList(items: string[]): TreeItem[] {
  return items.map((item) => ({
    isLeaf: true,
    path: item,
    key: `${item}-set`,
    parent: null,
    level: 0,
    label: item,
  }));
}
