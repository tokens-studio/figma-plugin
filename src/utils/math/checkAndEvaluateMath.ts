import { Parser } from 'expr-eval';

const parser = new Parser();

export function checkAndEvaluateMath(expr: string) {
  try {
    parser.evaluate(expr);
    return +parser.evaluate(expr).toFixed(3);
  } catch (ex) {
    return expr;
  }
}
