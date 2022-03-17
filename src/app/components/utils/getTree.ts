export function getTree(items) {
  const tree = items.reduce((acc, curr) => {
    const path = curr.split('/');
    const parentName = path.length > 1 ? path.slice(0, -1).join('/') : '';

    if (parentName !== '' && !acc.find((item) => item.path === parentName)) {
      console.log('ITEM', curr, path.slice(0, -2));

      const label = items.some((item) => item.startsWith(path.slice(0, -2).join('/'))) ? path[path.length - 2] : path.join('/');
      acc.push({
        path: parentName, parent: path.slice(0, -2).join('/'), type: 'folder', level: path.length - 2, label,
      });
    }
    acc.push({
      path: curr, parent: parentName, type: 'set', level: path.length - 1, label: path[path.length - 1],
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
