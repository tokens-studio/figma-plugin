export function isPrimitiveValue<V>(value: V): value is Extract<V, boolean | number | string> {
  return (
    typeof value === 'string'
    || typeof value === 'boolean'
    || typeof value === 'number'
  );
}
