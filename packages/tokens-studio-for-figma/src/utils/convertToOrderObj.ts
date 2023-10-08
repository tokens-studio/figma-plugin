export function convertToOrderObj(value: Record<string, string>) {
  return Object.keys(value).reduce<Record<string, number>>((acc, crr, index) => {
    acc[crr] = index;
    return acc;
  }, {});
}
