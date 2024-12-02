export function getColorSwatchStyle(tokenValue: string) {
  return tokenValue.includes(';') ? { background: tokenValue.replace(/;/g, '') } : { background: tokenValue };
}
