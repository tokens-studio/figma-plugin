// Splits gradient content on commas that are outside parentheses so that
// rgb()/rgba() stop colors aren't shattered by their internal commas.
const splitTopLevelCommas = (content: string): string[] => {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(content.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(content.slice(start));
  return parts;
};

export const getReferenceTokensFromGradient = (rawValue: string): string[] => {
  // Extract content between parentheses, regardless of gradient type
  const startIndex = rawValue.indexOf('(');
  const endIndex = rawValue.lastIndexOf(')');

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const rawValueDetails = splitTopLevelCommas(rawValue.substring(startIndex + 1, endIndex));
  // Push one entry per stop-like part so indices align with gradientStops;
  // non-color prefixes (e.g. angle, "circle", "from Xdeg") are skipped.
  const referenceTokens: string[] = rawValueDetails.reduce((acc: string[], curr: string) => {
    if (curr.includes('#') || curr.includes('{') || /\brgb/i.test(curr) || /\bhsl/i.test(curr)) {
      const matches = curr.match(/{(.*?)}/g);
      acc.push(matches ? matches[0].replace(/[{}]/g, '') : '');
    }
    return acc;
  }, []);

  return referenceTokens;
};
