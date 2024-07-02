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

export function checkAndEvaluateMath(expr: string) {
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
