export function convertFontFamilyToFigma(value: string, shouldOutputForVariables = false) {
  const stringValue = value.toString();
  try {
    if (shouldOutputForVariables) {
      // Studio's server resolver returns fontFamilies as an array-shaped string
      // (e.g. '["Arial","Helvetica"]'). Try JSON.parse first so quoted family names
      // containing commas (e.g. '["Font, Name","Arial"]') survive intact; fall back
      // to a comma split for single- or unquoted forms like "['Arial']" / "[Arial]".
      const trimmed = stringValue.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        if (trimmed.includes('"')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
              return parsed[0].trim();
            }
          } catch {
            // fall through to the split-based fallback
          }
        }
        const inner = trimmed.slice(1, -1);
        const first = inner.split(',')[0]?.trim().replace(/^['"]|['"]$/g, '').trim() ?? '';
        return first.length > 0 ? first : stringValue;
      }
      const fontFamilies = stringValue.split(',');
      return fontFamilies[0].trim().replace(/['"]/g, '');
    }
    return stringValue;
  } catch (e) {
    console.error('font family err', stringValue, e);
    return stringValue;
  }
}
