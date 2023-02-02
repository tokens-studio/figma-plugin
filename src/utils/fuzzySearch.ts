export default function fuzzySearch(baseString: string, query: string) {
  let i = 0;
  let n = -1;
  let l;
  query = query.toLowerCase();
  // eslint-disable-next-line no-cond-assign, no-plusplus
  for (; l = query[i++];) {
    // eslint-disable-next-line no-bitwise, no-cond-assign
    if (!~(n = baseString.indexOf(l, n + 1))) {
      return false;
    }
  }
  return true;
}
