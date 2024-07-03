export const getReferenceTokensFromGradient = (rawValue: string): string[] => {
  const rawValueDetails = rawValue.replace('linear-gradient(', '').replace(')', '').split(',');
  const referenceTokens: string[] = rawValueDetails.reduce((acc: string[], curr: string) => {
    // Check is the current part contains color value or reference token
    if (curr.includes('#') || curr.includes('{')) {
      const matches = curr.match(/{(.*?)}/g);
      // Return empty string in case of not reference token
      acc.push(matches ? matches[0].replace(/[\{\}]/g, '') : '');
    }
    return acc;
  }, []);

  return referenceTokens;
}