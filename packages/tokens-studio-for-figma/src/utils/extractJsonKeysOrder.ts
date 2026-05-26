export function extractJsonKeysOrder(json: string): string[] {
  const paths: string[] = [];
  const stack: string[] = [];
  let i = 0;
  let arrayDepth = 0;

  const skipWhitespaceAndComments = () => {
    while (i < json.length) {
      const char = json[i];
      if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
        i += 1;
      } else if (char === '/' && json[i + 1] === '/') {
        // Line comment
        i += 2;
        while (i < json.length && json[i] !== '\n' && json[i] !== '\r') {
          i += 1;
        }
      } else if (char === '/' && json[i + 1] === '*') {
        // Block comment
        i += 2;
        while (i < json.length && !(json[i] === '*' && json[i + 1] === '/')) {
          i += 1;
        }
        if (i < json.length) i += 2;
      } else {
        break;
      }
    }
  };

  const parseString = (): string | null => {
    const quote = json[i];
    if (quote !== '"' && quote !== "'") return null;
    i += 1; // consume quote
    let str = '';
    while (i < json.length) {
      const char = json[i];
      if (char === quote) {
        i += 1; // consume quote
        return str;
      }
      if (char === '\\') {
        str += json[i + 1] || '';
        i += 2;
      } else {
        str += char;
        i += 1;
      }
    }
    return str;
  };

  while (i < json.length) {
    skipWhitespaceAndComments();
    if (i >= json.length) break;

    const char = json[i];
    if (char === '{') {
      i += 1;
    } else if (char === '}') {
      if (arrayDepth === 0) {
        stack.pop();
      }
      i += 1;
    } else if (char === '[') {
      arrayDepth += 1;
      i += 1;
    } else if (char === ']') {
      arrayDepth -= 1;
      i += 1;
    } else if (char === '"' || char === "'") {
      const str = parseString();
      if (str !== null) {
        skipWhitespaceAndComments();
        if (json[i] === ':') {
          i += 1; // consume ':'
          skipWhitespaceAndComments();
          const fullPath = [...stack, str].join('.');
          paths.push(fullPath);

          // Check if this key opens a nested object
          if (json[i] === '{' && arrayDepth === 0) {
            stack.push(str);
          }
        }
      } else {
        i += 1;
      }
    } else {
      i += 1;
    }
  }

  return paths;
}
