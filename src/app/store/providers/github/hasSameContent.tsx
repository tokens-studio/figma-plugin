export function hasSameContent<V>(value: V, compareTo: string) {
  return JSON.stringify(value) === compareTo;
}
