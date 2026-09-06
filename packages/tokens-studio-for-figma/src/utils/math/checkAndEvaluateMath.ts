import { Parser } from 'expr-eval';
import calcAstParser from 'postcss-calc-ast-parser';
import { Root } from 'postcss-calc-ast-parser/dist/types/ast';

const parser = new Parser();

/**
 * Clamps the value of x between min and max
 * @param x
 * @param min
 * @param max
 * @returns
 */
parser.functions.clamped = (x: number, min: number, max: number): number => Math.max(Math.min(x, max), min);

/**
 * One dimensional linear interpolation
 * @param x Normalized value between 0 and 1
 * @param min
 * @param max
 * @returns
 */
parser.functions.lerp = (x: number, start: number, end: number): number => start + (end - start) * x;

/**
 * Returns a normalized value between 0 - 1.
 * @param x
 * @param start
 * @param end
 * @returns
 */
parser.functions.norm = (x: number, start: number, end: number): number => (x - start) / (end - start);

/**
 * Creates a one dimensional cubicBezier
 * @remarks We have to do a significant overhaul to the system to support multidimensional functions. Seems like expr-eval can support neither array or property accessors
 * @param x1
 * @param x2
 * @returns
 */
parser.functions.cubicBezier1D = (x1: number, x2: number) => {
  const xx = [0, x1, x2, 1];

  return (t: number) => {
    const coeffs = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
    const x = coeffs.reduce((acc, c, i) => acc + c * xx[i], 0);
    return x;
  };
};

// eslint-disable-next-line
parser.functions.sample = (func: Function, ...args: any[]) => {
  return func(...args);
};

// Return true when the input contains a comma at nesting level 0 (outside
// any parentheses/brackets). expr-eval reads comma as a sequence operator
// and collapses "a, b, c, d" to just d, which silently corrupts tuple-shaped
// token values like cubicBezier "0.4, 0, 0.2, 1".
function hasTopLevelComma(input: string): boolean {
  let depth = 0;
  for (let i = 0; i < input.length; i += 1) {
    const c = input[i];
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') depth = Math.max(0, depth - 1);
    else if (c === ',' && depth === 0) return true;
  }
  return false;
}

export function checkAndEvaluateMath(expr: string) {
  // Bail out for tuple-shaped inputs — see hasTopLevelComma for why.
  if (typeof expr === 'string' && hasTopLevelComma(expr)) return expr;

  let calcParsed: Root;

  try {
    calcParsed = calcAstParser.parse(expr);
  } catch (ex) {
    return expr;
  }

  const calcReduced = calcAstParser.reduceExpression(calcParsed);

  let unitlessExpr = expr;
  let unit;

  if (calcReduced && calcReduced.type !== 'Number') {
    unitlessExpr = expr.replace(new RegExp(calcReduced.unit, 'ig'), '');
    unit = calcReduced.unit;
  }

  let evaluated: number;

  try {
    evaluated = parser.evaluate(`${unitlessExpr}`);
  } catch (ex) {
    return expr;
  }
  try {
    return unit ? `${evaluated}${unit}` : Number.parseFloat(evaluated.toFixed(3));
  } catch (ex) {
    return expr;
  }
}
