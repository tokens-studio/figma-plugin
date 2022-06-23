import compact from 'just-compact';

export function joinPath(...paths: string[]) {
  return compact(paths).map((path) => (
    path.replace(/^\/+/, '').replace(/\/+$/, '')
  )).join('/');
}
