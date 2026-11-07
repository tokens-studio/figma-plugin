/**
 * Evaluates the math expressions allowed in token values.
 *
 * Token values can come from files shared by other people, so they are untrusted input.
 * This evaluator never generates code and has no variables, assignment or property access.
 * Names resolve only through the Maps below, so `constructor` or `__proto__` cannot reach
 * a JavaScript object. Anything it does not recognise throws, and callers keep the input.
 */

type Thunk = () => unknown;
type BinaryOperator = (left: Thunk, right: Thunk) => unknown;
type Token = { kind: 'number' | 'string' | 'name' | 'operator'; text: string };
type UnaryFunction = (x: number) => number;
type ExpressionFunction = (...args: any[]) => unknown;

const TOKEN_PATTERN = /((?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)|([A-Za-z_][A-Za-z0-9_]*)|("[^"\\]*"|'[^'\\]*')|(<=|>=|==|!=|[-+*/%^?:<>(),])/g;
const WHITESPACE = new Set([' ', '\t', '\n', '\r']);
const WORD_OPERATORS = new Set(['and', 'or', 'not']);

const CONSTANTS = new Map<string, unknown>([
  ['PI', Math.PI],
  ['E', Math.E],
  ['true', true],
  ['false', false],
]);

const UNARY_FUNCTIONS = new Map<string, UnaryFunction>([
  ['abs', Math.abs],
  ['acos', Math.acos],
  ['acosh', Math.acosh],
  ['asin', Math.asin],
  ['asinh', Math.asinh],
  ['atan', Math.atan],
  ['atanh', Math.atanh],
  ['cbrt', Math.cbrt],
  ['ceil', Math.ceil],
  ['cos', Math.cos],
  ['cosh', Math.cosh],
  ['exp', Math.exp],
  ['expm1', Math.expm1],
  ['floor', Math.floor],
  ['lg', Math.log10],
  ['ln', Math.log],
  ['log', Math.log],
  ['log10', Math.log10],
  ['log1p', Math.log1p],
  ['log2', Math.log2],
  ['round', Math.round],
  ['sign', Math.sign],
  ['sin', Math.sin],
  ['sinh', Math.sinh],
  ['sqrt', Math.sqrt],
  ['tan', Math.tan],
  ['tanh', Math.tanh],
  ['trunc', Math.trunc],
]);

/**
 * Rounds to a number of decimals. Without decimals it rounds to a whole number.
 * Shifts through the exponent so that 1.005 rounds to 1.01 and not to 1.
 */
function roundTo(value: number, decimals?: number): number {
  if (typeof decimals === 'undefined' || +decimals === 0) return Math.round(value);

  const exponent = -(+decimals);
  if (Number.isNaN(+value) || exponent % 1 !== 0) return NaN;

  const [base, shift] = String(+value).split('e');
  const rounded = Math.round(+`${base}e${shift ? +shift - exponent : -exponent}`);
  const [roundedBase, roundedShift] = String(rounded).split('e');
  return +`${roundedBase}e${roundedShift ? +roundedShift + exponent : exponent}`;
}

/**
 * Creates a one dimensional cubic bezier curve, to be evaluated with `sample`.
 */
function cubicBezier1D(x1: number, x2: number) {
  const points = [0, x1, x2, 1];

  return (t: number): number => {
    const coefficients = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
    return coefficients.reduce((total, coefficient, index) => total + coefficient * points[index], 0);
  };
}

const FUNCTIONS = new Map<string, ExpressionFunction>([
  ['atan2', Math.atan2],
  ['clamped', (x: number, min: number, max: number) => Math.max(Math.min(x, max), min)],
  ['cubicBezier1D', cubicBezier1D],
  ['hypot', Math.hypot],
  ['if', (condition: unknown, whenTrue: unknown, whenFalse: unknown) => (condition ? whenTrue : whenFalse)],
  // x is a normalized value between 0 and 1
  ['lerp', (x: number, start: number, end: number) => start + (end - start) * x],
  ['max', Math.max],
  ['min', Math.min],
  // Returns a normalized value between 0 and 1
  ['norm', (x: number, start: number, end: number) => (x - start) / (end - start)],
  ['pow', (base: number, exponent: number) => base ** exponent],
  ['pyt', Math.hypot],
  ['roundTo', roundTo],
  ['sample', (curve: (...args: unknown[]) => unknown, ...args: unknown[]) => curve(...args)],
]);

const operators = (entries: [string, BinaryOperator][]) => new Map(entries);
const asNumber = (thunk: Thunk) => thunk() as number;

const OR_OPERATORS = operators([['or', (a, b) => Boolean(a() || b())]]);
const AND_OPERATORS = operators([['and', (a, b) => Boolean(a() && b())]]);
const COMPARISON_OPERATORS = operators([
  ['==', (a, b) => a() === b()],
  ['!=', (a, b) => a() !== b()],
  ['<', (a, b) => asNumber(a) < asNumber(b)],
  ['<=', (a, b) => asNumber(a) <= asNumber(b)],
  ['>', (a, b) => asNumber(a) > asNumber(b)],
  ['>=', (a, b) => asNumber(a) >= asNumber(b)],
]);
const ADDITIVE_OPERATORS = operators([
  ['+', (a, b) => Number(a()) + Number(b())],
  ['-', (a, b) => asNumber(a) - asNumber(b)],
]);
const MULTIPLICATIVE_OPERATORS = operators([
  ['*', (a, b) => asNumber(a) * asNumber(b)],
  ['/', (a, b) => asNumber(a) / asNumber(b)],
  ['%', (a, b) => asNumber(a) % asNumber(b)],
]);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < input.length) {
    if (WHITESPACE.has(input[position])) {
      position += 1;
    } else {
      TOKEN_PATTERN.lastIndex = position;
      const match = TOKEN_PATTERN.exec(input);
      if (!match || match.index !== position) throw new Error(`Unexpected character at ${position}`);

      const [text, number, name, string] = match;
      if (number) tokens.push({ kind: 'number', text });
      else if (name) tokens.push({ kind: WORD_OPERATORS.has(text) ? 'operator' : 'name', text });
      else if (string) tokens.push({ kind: 'string', text: text.slice(1, -1) });
      else tokens.push({ kind: 'operator', text });
      position += text.length;
    }
  }
  return tokens;
}

/**
 * Parses an expression with recursive descent, lowest precedence first:
 * `?:`, `or`, `and`, comparisons, `+ -`, `* / %`, unary `+ - not`, `^`, then values.
 * It returns a thunk so that untaken `?:` branches and `and`/`or` operands stay unevaluated.
 */
function parse(tokens: Token[]): Thunk {
  let index = 0;

  const accept = (text: string): boolean => {
    const token = tokens[index];
    if (token?.kind !== 'operator' || token.text !== text) return false;
    index += 1;
    return true;
  };

  const expect = (text: string): void => {
    if (!accept(text)) throw new Error(`Expected ${text}`);
  };

  const parseBinary = (next: () => Thunk, table: Map<string, BinaryOperator>) => (): Thunk => {
    let left = next();
    for (;;) {
      const token = tokens[index];
      const operator = token?.kind === 'operator' ? table.get(token.text) : undefined;
      if (!operator) return left;
      index += 1;

      const previous = left;
      const right = next();
      left = () => operator(previous, right);
    }
  };

  const parseArguments = (): Thunk[] => {
    const args: Thunk[] = [];
    if (accept(')')) return args;
    do {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      args.push(parseConditional());
    } while (accept(','));
    expect(')');
    return args;
  };

  const parseName = (name: string): Thunk => {
    const args = accept('(') ? parseArguments() : undefined;
    if (!args) {
      return () => {
        if (!CONSTANTS.has(name)) throw new Error(`Unknown name ${name}`);
        return CONSTANTS.get(name);
      };
    }

    const unary = UNARY_FUNCTIONS.get(name);
    if (unary && args.length !== 1) throw new Error(`${name} takes one argument`);
    return () => {
      const fn: ExpressionFunction | undefined = unary ?? FUNCTIONS.get(name);
      if (!fn) throw new Error(`Unknown function ${name}`);
      return fn(...args.map((arg) => arg()));
    };
  };

  const parseValue = (): Thunk => {
    if (accept('(')) {
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      const inner = parseConditional();
      expect(')');
      return inner;
    }

    const token = tokens[index];
    if (!token || token.kind === 'operator') throw new Error('Expected a value');
    index += 1;

    if (token.kind === 'number') {
      const value = parseFloat(token.text);
      return () => value;
    }
    if (token.kind === 'string') return () => token.text;
    return parseName(token.text);
  };

  const parseUnary = (): Thunk => {
    if (accept('-')) {
      const operand = parseUnary();
      return () => -asNumber(operand);
    }
    if (accept('+')) {
      const operand = parseUnary();
      return () => Number(operand());
    }
    if (accept('not')) {
      const operand = parseUnary();
      return () => !operand();
    }

    const base = parseValue();
    if (!accept('^')) return base;
    // The exponent goes back through parseUnary, so 2^3^2 is 2^(3^2) and 2^-1 works.
    const exponent = parseUnary();
    return () => asNumber(base) ** asNumber(exponent);
  };

  const parseMultiplicative = parseBinary(parseUnary, MULTIPLICATIVE_OPERATORS);
  const parseAdditive = parseBinary(parseMultiplicative, ADDITIVE_OPERATORS);
  const parseComparison = parseBinary(parseAdditive, COMPARISON_OPERATORS);
  const parseAnd = parseBinary(parseComparison, AND_OPERATORS);
  const parseOr = parseBinary(parseAnd, OR_OPERATORS);

  function parseConditional(): Thunk {
    const condition = parseOr();
    if (!accept('?')) return condition;

    const whenTrue = parseConditional();
    expect(':');
    const whenFalse = parseConditional();
    return () => (condition() ? whenTrue() : whenFalse());
  }

  const expression = parseConditional();
  if (index !== tokens.length) throw new Error('Unexpected input after the expression');
  return expression;
}

/**
 * Returns the value of the expression, which is not always a number:
 * `1 < 2` gives a boolean and `cubicBezier1D(0.1, 0.9)` gives a function.
 * @throws When the input is not a valid expression
 */
export function evaluateExpression(input: string): unknown {
  return parse(tokenize(input))();
}
