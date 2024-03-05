export type TreeItem = {
  key: string;
  path: string;
  parent: string | null;
  level: number;
  label: string;
  isLeaf: boolean;
};

export function tokenSetListToTree(items: string[]) {
  const tree = items.reduce<TreeItem[]>((acc, curr) => {
    const path = curr.split('/');
    const parentName = path.length > 1 ? path.slice(0, -1).join('/') : '';
    const parentIndex = acc.findIndex((item) => item.path === parentName);

    if (parentName !== '' && parentIndex < 0) {
      const parentNameSplit = parentName.split('/');
      parentNameSplit.forEach((directory, index) => {
        const label = directory;
        if (!acc.find((item) => item.path === parentNameSplit.slice(0, index + 1).join('/'))) {
          acc.push({
            isLeaf: false,
            path: parentNameSplit.slice(0, index + 1).join('/'),
            key: parentNameSplit.slice(0, index + 1).join('/'),
            parent: path.slice(0, index).join('/'),
            level: index,
            label,
          });
        }
      });
    }

    if (parentIndex >= 0) {
      const childrenLength = acc.filter((item) => item.path.startsWith(`${parentName}/`)).length;
      acc.splice(parentIndex + childrenLength + 1, 0, {
        isLeaf: true,
        path: curr,
        key: path.join('/'),
        parent: parentName,
        level: path.length - 1,
        label: path[path.length - 1],
      });
    } else {
      acc.push({
        isLeaf: true,
        path: curr,
        key: path.join('/'),
        parent: parentName,
        level: path.length - 1,
        label: path[path.length - 1],
      });
    }
    return acc;
  }, []);
  // @README sorting used to happen here
  // this logic has moved to where the tokensets are being pulled
  return tree;
}
