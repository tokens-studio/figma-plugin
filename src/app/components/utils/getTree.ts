export type TreeItem = {
  key: string;
  path: string;
  parent: string | null;
  level: number;
  label: string;
  isLeaf: boolean;
};

export function getTree(items: string[]) {
  const tree = items.reduce<TreeItem[]>((acc, curr) => {
    const path = curr.split('/');
    const parentName = path.length > 1 ? path.slice(0, -1).join('/') : '';

    if (parentName !== '' && !acc.find((item) => item.path === parentName)) {
      const label = items.some((item) => item.startsWith(path.slice(0, -2).join('/'))) ? path[path.length - 2] : path.join('/');
      acc.push({
        isLeaf: false,
        path: parentName,
        key: path.slice(0, -1).join('/'),
        parent: path.slice(0, -2).join('/'),
        level: path.length - 2,
        label,
      });
    }
    acc.push({
      isLeaf: true,
      path: curr,
      key: path.join('/'),
      parent: parentName,
      level: path.length - 1,
      label: path[path.length - 1],
    });
    return acc;
  }, []);
  const sorted = tree.sort((a, b) => {
    if (a.path < b.path) {
      return -1;
    }
    if (a.path > b.path) {
      return 1;
    }
    return 0;
  });

  return sorted;
}
