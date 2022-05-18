import { Parser } from 'expr-eval';
import calcAstParser from 'postcss-calc-ast-parser';
import { Root } from 'postcss-calc-ast-parser/dist/types/ast';

const parser = new Parser();

export function checkAndEvaluateMath(expr: string) {
  let calcParsed: Root;

  try {
    calcParsed = calcAstParser.parse(expr);
  } catch (ex) {
    return expr;
  }

  const calcReduced = calcAstParser.reduceExpression(calcParsed);
  let unitlessExpr = expr;
  let unit = '';

  if (calcReduced && calcReduced.type !== 'Number') {
    unitlessExpr = expr.replace(new RegExp(calcReduced.unit, 'ig'), '');
    unit = calcReduced.unit;
  }

  let evaluated: number;

  try {
    evaluated = parser.evaluate(unitlessExpr);
  } catch (ex) {
    return expr;
  }

  return unit ? `${evaluated}${unit}` : Number.parseFloat(evaluated.toFixed(3));
}
