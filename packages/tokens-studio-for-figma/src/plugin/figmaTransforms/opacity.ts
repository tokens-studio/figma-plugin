export default function convertOpacityToFigma(value: string) {
  // Matches 50%, 100%, etc.
  const matched = value.match(/(\d+%)/);
  if (matched) {
    return Number(matched[0].slice(0, -1)) / 100;
  }
  return Number(value);
}
