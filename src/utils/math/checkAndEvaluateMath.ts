import { Parser } from 'expr-eval';
import calcAstParser from 'postcss-calc-ast-parser';
import { Root } from 'postcss-calc-ast-parser/dist/types/ast';

const parser = new Parser();

parser.functions.round = (x: number):number => Math.round(x);
parser.functions.toPrecision = (x: number, n: number):number => parseFloat(x.toPrecision(n));
parser.functions.toFixed = (x: number, n: number):number => parseFloat(x.toFixed(n));

parser.functions.quadIn = (t: number): number => t * t;
parser.functions.quadOut = (t: number): number => t * (2 - t);
parser.functions.quadInOut = (t: number): number => {
  t *= 2;
  return t <= 1 ? t * t : ((t - 2) * (2 - t) + 1) / 2;
};

parser.functions.cubicIn = (t: number): number => t * t * t;
parser.functions.cubicOut = (t: number): number => (t - 1) * (t - 1) * (t - 1) + 1;
parser.functions.cubicInOut = (t: number): number => {
  t *= 2;
  return t <= 1 ? t * t * t : ((t - 2) * t * t + 2) / 2;
};

parser.functions.degToRad = (deg: number): number => deg * (Math.PI / 180);
parser.functions.radToDeg = (rad: number): number => rad * (180 / Math.PI);

parser.functions.sin = (rad: number): number => Math.sin(rad);
parser.functions.cos = (rad: number): number => Math.cos(rad);
parser.functions.tan = (rad: number): number => Math.tan(rad);

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
