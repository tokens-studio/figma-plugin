import calcAstParser from 'postcss-calc-ast-parser';
import { Root } from 'postcss-calc-ast-parser/dist/types/ast';
import { evaluateExpression } from './evaluateExpression';

// Return true when the input contains a comma at nesting level 0 (outside
// any parentheses/brackets). These are tuple-shaped token values like a
// cubicBezier "0.4, 0, 0.2, 1", which are not math and must stay as they are.
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

  let unitlessExpr = expr;
  let unit;

  try {
    const calcParsed: Root = calcAstParser.parse(expr);
    const calcReduced = calcAstParser.reduceExpression(calcParsed);

    if (calcReduced && calcReduced.type !== 'Number') {
      unitlessExpr = expr.replace(new RegExp(calcReduced.unit, 'ig'), '');
      unit = calcReduced.unit;
    }
  } catch (ex) {
    return expr;
  }

  let evaluated: unknown;

  try {
    evaluated = evaluateExpression(`${unitlessExpr}`);
  } catch (ex) {
    return expr;
  }

  // Booleans, strings and curves are not valid token results on their own.
  if (typeof evaluated !== 'number') return expr;

  return unit ? `${evaluated}${unit}` : Number.parseFloat(evaluated.toFixed(3));
}
