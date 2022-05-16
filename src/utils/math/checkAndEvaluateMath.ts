import { Parser } from 'expr-eval';
import calcAstParser from 'postcss-calc-ast-parser';

const parser = new Parser();

export function checkAndEvaluateMath(expr: string) {
  const calcParsed = calcAstParser.parse(expr);
  const calcReduced = calcAstParser.reduceExpression(calcParsed);

  if (!calcReduced) {
    return expr;
  }

  let unitlessExpr = expr;
  let unit = '';

  if (calcReduced.type !== 'Number') {
    unitlessExpr = expr.replace(new RegExp(calcReduced.unit, 'ig'), '');
    unit = calcReduced.unit;
  }

  try {
    return +parser.evaluate(unitlessExpr).toFixed(3) + unit;
  } catch (ex) {
    return expr;
  }
}
