export default function getColorSwatchStyle(tokenValue: string) {
  return tokenValue.includes(';')
    ? { background: tokenValue.replace(/;/g, '') }
    : { backgroundColor: tokenValue };
}
