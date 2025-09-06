export function clipToFourDecimals(num: number): number {
  return Math.trunc(num * 10000) / 10000;
}