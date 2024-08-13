export default function convertOpacityToFigma(value: string, shouldOutputForVariables?: boolean) {
  // Matches 50%, 100%, etc.
  const matched = value.match(/(\d+%)/);

  if (matched) {
    const matchedValue = Number(matched[0].slice(0, -1));
    if (shouldOutputForVariables) {
      return matchedValue;
    }
    return matchedValue / 100;
  }

  // Figma expects floats to be between 1 and 100, yet our users can enter opacity as 0-1 as well. We need to create appropriately.
  const numericValue = Number(value);
  if (shouldOutputForVariables && numericValue >= 0 && numericValue <= 1) {
    return numericValue * 100;
  }
  return numericValue;
}
