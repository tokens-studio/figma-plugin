export const getReferenceTokensFromGradient = (rawValue: string): string[] => {
  // Extract content between parentheses, regardless of gradient type
  const startIndex = rawValue.indexOf('(');
  const endIndex = rawValue.lastIndexOf(')');

  if (startIndex === -1 || endIndex === -1) {
    return [];
  }

  const rawValueDetails = rawValue.substring(startIndex + 1, endIndex).split(',');
  const referenceTokens: string[] = rawValueDetails.reduce((acc: string[], curr: string) => {
    // Check if the current part contains color value or reference token
    if (curr.includes('#') || curr.includes('{')) {
      const matches = curr.match(/{(.*?)}/g);
      // Return empty string in case of not reference token
      acc.push(matches ? matches[0].replace(/[{}]/g, '') : '');
    }
    return acc;
  }, []);

  return referenceTokens;
};
