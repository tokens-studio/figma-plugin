export function assignObjectByOrder(value: Record<string, string>, orderObj: Record<string, string>) {
  return Object.assign({}, ...Object.keys(value).sort((a, b) => Number(orderObj[a as keyof typeof value]) - Number(orderObj[b as keyof typeof value]))
    .map((x) => ({ [x]: value[x as keyof typeof value] })));
}
