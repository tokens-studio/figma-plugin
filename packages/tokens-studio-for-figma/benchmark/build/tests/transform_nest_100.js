/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/is-plain-object/index.js":
/*!***************************************************!*\
  !*** ../../node_modules/is-plain-object/index.js ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(/*! isobject */ "../../node_modules/isobject/index.js");

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),

/***/ "../../node_modules/isobject/index.js":
/*!********************************************!*\
  !*** ../../node_modules/isobject/index.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/factory.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/factory.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const valueParserUnit = __webpack_require__(/*! postcss-value-parser/lib/unit */ "../../node_modules/postcss-calc-ast-parser/node_modules/postcss-value-parser/lib/unit.js");
const Impl = __webpack_require__(/*! ./util/node-impl */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/node-impl.js");
const LENGTH_UNITS = [
    "em",
    "ex",
    "ch",
    "rem",
    "vw",
    "vh",
    "vmin",
    "vmax",
    "px",
    "mm",
    "cm",
    "in",
    "pt",
    "pc",
    "Q",
    "vm",
];
const ANGLE_UNITS = ["deg", "grad", "turn", "rad"];
const TIME_UNITS = ["s", "ms"];
const FREQUENCY_UNITS = ["Hz", "kHz"];
const RESOLUTION_UNITS = ["dpi", "dpcm", "dppm"];
const FLEX_UNITS = ["fr"];
const L_LENGTH_UNITS = LENGTH_UNITS.map(u => u.toLowerCase());
const L_ANGLE_UNITS = ANGLE_UNITS.map(u => u.toLowerCase());
const L_TIME_UNITS = TIME_UNITS.map(u => u.toLowerCase());
const L_FREQUENCY_UNITS = FREQUENCY_UNITS.map(u => u.toLowerCase());
const L_RESOLUTION_UNITS = RESOLUTION_UNITS.map(u => u.toLowerCase());
const L_FLEX_UNITS = FLEX_UNITS.map(u => u.toLowerCase());
function newPunctuator(token, before) {
    if (token.value === "," || token.value === ")") {
        return newTokenNode(Impl.Punctuator, token, token.value, before);
    }
    throw new Error(`illegal argument error "${token.value}"`);
}
exports.newPunctuator = newPunctuator;
function newOperator(token, before) {
    return newTokenNode(Impl.Operator, token, token.value, before);
}
exports.newOperator = newOperator;
function newString(token, before) {
    return newTokenNode(Impl.StringNode, token, token.value, before);
}
exports.newString = newString;
function newWordNode(token, before) {
    return newValueNode(token, before);
}
exports.newWordNode = newWordNode;
function newFunction(token, before, open) {
    return new Impl.FunctionNode(token.value, before, {
        start: token.source.start,
        end: open.source.end,
    });
}
exports.newFunction = newFunction;
function newParentheses(token, before) {
    return new Impl.Parentheses(before, {
        start: token.source.start,
        end: token.source.end,
    });
}
exports.newParentheses = newParentheses;
function newMathExpression(left, op, right) {
    const opNode = typeof op === "string"
        ? newTokenNode(Impl.Operator, { source: { start: { index: 0 }, end: { index: 0 } } }, op, " ")
        : op;
    const { before } = left.raws;
    left.raws.before = "";
    return new Impl.MathExpression(left, opNode, right, before, {
        start: left.source.start,
        operator: opNode.source,
        end: right.source.end,
    });
}
exports.newMathExpression = newMathExpression;
function newValueNode(token, before) {
    if (token.type === "word") {
        const parsedUnit = valueParserUnit(token.value);
        if (parsedUnit) {
            const n = newNumNode(parsedUnit, token, before);
            if (n) {
                return n;
            }
        }
    }
    return newTokenNode(Impl.Word, token, token.value, before);
}
function newNumNode(parsedUnit, token, before) {
    const { source } = token;
    if (!parsedUnit.unit) {
        return new Impl.NumberValue(parsedUnit.number, before, source);
    }
    const lunit = parsedUnit.unit.toLowerCase();
    function unitNode(WithUnitValue, unit) {
        const n = new WithUnitValue(parsedUnit.number, unit, before, source);
        if (unit !== parsedUnit.unit) {
            n.raws.unit = {
                raw: parsedUnit.unit,
                value: unit,
            };
        }
        return n;
    }
    let unitIndex;
    if ((unitIndex = L_LENGTH_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.LengthValue, LENGTH_UNITS[unitIndex]);
    }
    if ((unitIndex = L_ANGLE_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.AngleValue, ANGLE_UNITS[unitIndex]);
    }
    if ((unitIndex = L_TIME_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.TimeValue, TIME_UNITS[unitIndex]);
    }
    if ((unitIndex = L_FREQUENCY_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.FrequencyValue, FREQUENCY_UNITS[unitIndex]);
    }
    if ((unitIndex = L_RESOLUTION_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.ResolutionValue, RESOLUTION_UNITS[unitIndex]);
    }
    if ((unitIndex = L_FLEX_UNITS.indexOf(lunit)) >= 0) {
        return unitNode(Impl.FlexValue, FLEX_UNITS[unitIndex]);
    }
    if (lunit === "%") {
        return unitNode(Impl.PercentageValue, "%");
    }
    return null;
}
function newTokenNode(TokenValue, token, value, before) {
    const { source } = token;
    return new TokenValue(value, before, source);
}


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/index.js":
/*!*************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/index.js ***!
  \*************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
var parser_1 = __webpack_require__(/*! ./parser */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/parser.js");
exports.Parser = parser_1.Parser;
var tokenizer_1 = __webpack_require__(/*! ./tokenizer */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/tokenizer.js");
exports.Tokenizer = tokenizer_1.Tokenizer;
var stringifier_1 = __webpack_require__(/*! ./stringifier */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/stringifier.js");
exports.Stringifier = stringifier_1.Stringifier;
var resolved_type_1 = __webpack_require__(/*! ./resolved-type */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/resolved-type.js");
exports.getResolvedType = resolved_type_1.getResolvedType;
var reducer_1 = __webpack_require__(/*! ./reducer */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/reducer.js");
exports.reduceExpression = reducer_1.reduce;
var factory_1 = __webpack_require__(/*! ./factory */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/factory.js");
exports.newMathExpression = factory_1.newMathExpression;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/parser.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/parser.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const AST = __webpack_require__(/*! ../types/ast */ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/index.js");
const Impl = __webpack_require__(/*! ./util/node-impl */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/node-impl.js");
const factory_1 = __webpack_require__(/*! ./factory */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/factory.js");
const calc_notation_1 = __webpack_require__(/*! ./util/calc-notation */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/calc-notation.js");
const utils_1 = __webpack_require__(/*! ./util/utils */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/utils.js");
const MAYBE_FUNCTION = /^([^-+0-9.]|-[^+0-9.])/u;
const PRECEDENCE = {
    "*": 3,
    "/": 3,
    "+": 2,
    "-": 2,
};
function srcLoc(node) {
    return node.source || { start: { index: 0 }, end: { index: 0 } };
}
function isExpression(node) {
    if (node && node.type !== "Punctuator" && node.type !== "Operator") {
        return node;
    }
    return null;
}
class Parser {
    constructor(tokenizer, _options) {
        this.tokenizer = tokenizer;
        this.root = new Impl.Root({
            start: {
                index: 0,
            },
            end: {
                index: 0,
            },
        });
        this.rescans = [];
        this.tokens = this.root.tokens;
        this.errors = this.root.errors;
    }
    parse() {
        let state = {
            container: this.root,
            fnName: "",
            post() {
            },
            eof() {
            },
        };
        while (state) {
            state = this.processExpressions(state);
        }
        const { tokens } = this;
        if (tokens.length > 0) {
            srcLoc(this.root).end.index =
                tokens[tokens.length - 1].source.end.index;
        }
        this.errors.unshift(...this.tokenizer.errors);
        this.errors.sort((e1, e2) => e1.index - e2.index);
        return this.root;
    }
    reportParseError(code, index = 0) {
        if (this.errors.find(e => e.code === code && e.index === index)) {
            return;
        }
        const error = AST.ParseError.fromCode(code, index);
        this.errors.push(error);
    }
    processExpressions(state) {
        let tokenSet;
        while ((tokenSet = this.scan())) {
            const { token } = tokenSet;
            switch (token.type) {
                case "word":
                    if (MAYBE_FUNCTION.test(token.value)) {
                        const next = this.scan();
                        if (next) {
                            if (!next.raws &&
                                next.token.type === "punctuator" &&
                                next.token.value === "(") {
                                return this.processFunction(token, tokenSet.raws, next.token, state);
                            }
                            this.back(next);
                        }
                    }
                    state.container.push(factory_1.newWordNode(token, tokenSet.raws));
                    break;
                case "string":
                    state.container.push(factory_1.newString(token, tokenSet.raws));
                    break;
                case "operator":
                    this.checkAndMergeMathExpr(state, PRECEDENCE[token.value]);
                    state.container.push(factory_1.newOperator(token, tokenSet.raws));
                    break;
                case "punctuator":
                    this.checkAndMergeMathExpr(state);
                    return this.processPunctuator(token, tokenSet.raws, state);
                default:
                    break;
            }
        }
        this.postStack(state);
        state.eof();
        return null;
    }
    checkAndMergeMathExpr(state, currPrecedence) {
        const { container } = state;
        const { nodes } = container;
        if (nodes.length >= 3) {
            const bfOp = nodes[nodes.length - 2];
            if (bfOp.type === "Operator" && PRECEDENCE[bfOp.value]) {
                if (currPrecedence == null ||
                    currPrecedence <= PRECEDENCE[bfOp.value]) {
                    const math = this.mergeMathExpr(state);
                    if (math) {
                        container.push(math);
                    }
                }
            }
        }
    }
    processPunctuator(token, before, state) {
        const { container, parent } = state;
        if (token.value === "(") {
            const node = factory_1.newParentheses(token, before);
            container.push(node);
            return this.createNestedStateContainer(node, state.fnName, state);
        }
        this.postStack(state);
        if (token.value === ")") {
            if (parent) {
                state.post(token, before);
                return parent;
            }
            this.reportParseError("unexpected-parenthesis", token.source.start.index);
        }
        container.push(factory_1.newPunctuator(token, before));
        return state;
    }
    processFunction(token, before, open, state) {
        const node = factory_1.newFunction(token, before, open);
        state.container.push(node);
        return this.createNestedStateContainer(node, node.name, state);
    }
    createNestedStateContainer(node, fnName, state) {
        return {
            container: node,
            parent: state,
            fnName,
            post(close, beforeClose) {
                if (beforeClose) {
                    node.raws.beforeClose = beforeClose;
                }
                srcLoc(node).end = close.source.end;
            },
            eof: () => {
                node.unclosed = true;
                const last = this.tokens[this.tokens.length - 1];
                const lastChild = node.last;
                if (lastChild) {
                    srcLoc(node).end = srcLoc(lastChild).end;
                }
                this.reportParseError("eof-in-bracket", last.source.end.index);
                state.eof();
            },
        };
    }
    mergeMathExpr(state) {
        const { container: { nodes }, } = state;
        const right = nodes.pop();
        const op = nodes.pop();
        const left = nodes.pop() || null;
        const restore = () => {
            if (left) {
                nodes.push(left);
            }
            nodes.push(op, right);
        };
        const reportError = (node) => {
            if (calc_notation_1.isMathFunction(state.fnName)) {
                this.reportParseError("unexpected-calc-token", srcLoc(node).start.index);
            }
        };
        const rightExpr = isExpression(right);
        if (utils_1.isComma(op)) {
            if (!rightExpr) {
                reportError(right);
            }
            restore();
            return null;
        }
        if (!left) {
            reportError(isExpression(op) ? right : op);
            restore();
            return null;
        }
        const leftExpr = isExpression(left);
        if (!leftExpr) {
            reportError(isExpression(nodes[nodes.length - 1]) ? op : left);
            restore();
            return null;
        }
        if (op.type !== "Operator") {
            reportError(op);
            restore();
            return null;
        }
        if (!rightExpr) {
            reportError(right);
            restore();
            return null;
        }
        return factory_1.newMathExpression(leftExpr, op, rightExpr);
    }
    postStack(state) {
        const { container } = state;
        const { nodes } = container;
        while (nodes.length > 1) {
            const math = this.mergeMathExpr(state);
            if (math) {
                container.push(math);
            }
            else {
                return;
            }
        }
    }
    scan() {
        const re = this.rescans.shift();
        if (re) {
            return re;
        }
        let raws = "";
        let token = this.tokenizer.nextToken();
        while (token) {
            this.tokens.push(token);
            if (token.type === "whitespace" ||
                token.type === "comment" ||
                token.type === "inline-comment") {
                raws += token.value;
            }
            else {
                return {
                    token,
                    raws,
                };
            }
            token = this.tokenizer.nextToken();
        }
        if (raws) {
            this.root.raws.after = raws;
        }
        return null;
    }
    back(tokenset) {
        this.rescans.unshift(tokenset);
    }
}
exports.Parser = Parser;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/reducer.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/reducer.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const calc_notation_1 = __webpack_require__(/*! ./util/calc-notation */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/calc-notation.js");
const utils_1 = __webpack_require__(/*! ./util/utils */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/utils.js");
function reduce(expr) {
    return reduceExpression(expr);
}
exports.reduce = reduce;
function reduceMathExpression(expr) {
    const left = reduceExpression(expr.left);
    const right = reduceExpression(expr.right);
    if (!left || !right) {
        return null;
    }
    switch (expr.operator) {
        case "+":
        case "-":
            return reduceAddSub(left, expr.operator, right);
        case "/":
            return reduceDivision(left, right);
        case "*":
            return reduceMultiple(left, right);
        default:
    }
    return null;
}
function reduceAddSub(left, operator, right) {
    if (left.type !== right.type) {
        return null;
    }
    const ope = operator === "-"
        ? (ln, rn) => ln - rn
        : (ln, rn) => ln + rn;
    if (left.type === "Number") {
        return {
            type: "Number",
            value: ope(left.value, right.value),
        };
    }
    const lunit = left.unit;
    const runit = right.unit;
    if (lunit === runit) {
        return {
            type: left.type,
            value: ope(left.value, right.value),
            unit: left.unit,
        };
    }
    return null;
}
function reduceDivision(left, right) {
    if (right.type !== "Number") {
        return null;
    }
    if (left.type === "Number") {
        return {
            type: "Number",
            value: left.value / right.value,
        };
    }
    return {
        type: left.type,
        value: left.value / right.value,
        unit: left.unit,
    };
}
function reduceMultiple(left, right) {
    if (left.type === "Number") {
        if (right.type === "Number") {
            return {
                type: "Number",
                value: left.value * right.value,
            };
        }
        return {
            type: right.type,
            value: left.value * right.value,
            unit: right.unit,
        };
    }
    else if (right.type === "Number") {
        return {
            type: left.type,
            value: left.value * right.value,
            unit: left.unit,
        };
    }
    return null;
}
function reduceExpression(expr) {
    if (expr.type === "Number" ||
        expr.type === "Length" ||
        expr.type === "Angle" ||
        expr.type === "Time" ||
        expr.type === "Frequency" ||
        expr.type === "Resolution" ||
        expr.type === "Percentage" ||
        expr.type === "Flex") {
        return expr;
    }
    if (expr.type === "MathExpression") {
        return reduceMathExpression(expr);
    }
    if (expr.type === "Parentheses" || expr.type === "Root") {
        if (expr.nodes.length === 1) {
            return reduceExpression(expr.nodes[0]);
        }
    }
    else if (expr.type === "Function") {
        if (expr.type === "Function") {
            if (calc_notation_1.isCalc(expr.name)) {
                return getCalcNumber(expr);
            }
        }
    }
    return null;
}
function getCalcNumber(fn) {
    const args = utils_1.getFunctionArguments(fn);
    if (args && args.length === 1) {
        return reduceExpression(args[0]);
    }
    return null;
}


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/resolved-type.js":
/*!*********************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/resolved-type.js ***!
  \*********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const calc_notation_1 = __webpack_require__(/*! ./util/calc-notation */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/calc-notation.js");
const utils_1 = __webpack_require__(/*! ./util/utils */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/utils.js");
function getResolvedType(expr) {
    const left = getType(expr.left);
    const right = getType(expr.right);
    const { operator } = expr;
    switch (operator) {
        case "+":
        case "-":
            if (left === "Unknown" || right === "Unknown") {
                return "Unknown";
            }
            if (left === right) {
                return left;
            }
            if (left === "Number" || right === "Number") {
                return "invalid";
            }
            if (left === "Percentage") {
                return right;
            }
            if (right === "Percentage") {
                return left;
            }
            return "invalid";
        case "*":
            if (left === "Unknown" || right === "Unknown") {
                return "Unknown";
            }
            if (left === "Number") {
                return right;
            }
            if (right === "Number") {
                return left;
            }
            return "invalid";
        case "/":
            if (right === "Unknown") {
                return "Unknown";
            }
            if (right === "Number") {
                return left;
            }
            return "invalid";
        default:
    }
    return "Unknown";
}
exports.getResolvedType = getResolvedType;
function getExpressionType(expr) {
    const { type } = expr;
    if (type === "Number" ||
        type === "Length" ||
        type === "Angle" ||
        type === "Time" ||
        type === "Frequency" ||
        type === "Resolution" ||
        type === "Percentage" ||
        type === "Flex") {
        return type;
    }
    return "Unknown";
}
function getType(expr) {
    if (expr.type === "MathExpression") {
        const rtype = getResolvedType(expr);
        return rtype === "invalid" ? "Unknown" : rtype;
    }
    if (expr.type === "Parentheses") {
        if (expr.nodes.length === 1) {
            return getType(expr.nodes[0]);
        }
        return "Unknown";
    }
    if (expr.type === "Function") {
        if (calc_notation_1.isCalc(expr.name)) {
            return getCalcFunctionType(expr);
        }
        if (calc_notation_1.isMin(expr.name) || calc_notation_1.isMax(expr.name)) {
            return getMinMaxFunctionType(expr);
        }
        if (calc_notation_1.isClamp(expr.name)) {
            return getClampFunctionType(expr);
        }
        return "Unknown";
    }
    return getExpressionType(expr);
}
function getCalcFunctionType(fn) {
    if (fn.nodes.length === 1) {
        return getFunctionArgumentsType(fn);
    }
    return "Unknown";
}
function getMinMaxFunctionType(fn) {
    return getFunctionArgumentsType(fn);
}
function getClampFunctionType(fn) {
    if (fn.nodes.length === 5) {
        return getFunctionArgumentsType(fn);
    }
    return "Unknown";
}
function getFunctionArgumentsType(fn) {
    const args = utils_1.getFunctionArguments(fn);
    if (!args) {
        return "Unknown";
    }
    const types = args.map(getType);
    let result = null;
    for (const type of types) {
        if (!result || result === "Percentage") {
            result = type;
        }
        else if (type === "Percentage") {
        }
        else if (result !== type) {
            return "Unknown";
        }
    }
    return result || "Unknown";
}


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/stringifier.js":
/*!*******************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/stringifier.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function rawVal(node, name) {
    const r = node.raws[name];
    return r ? r.raw : `${node[name]}`;
}
function raw(node, name) {
    const r = node.raws[name];
    return r || "";
}
function wrapRaws(node, inner) {
    return `${raw(node, "before")}${inner}`;
}
function numWithUnit(node) {
    return wrapRaws(node, `${rawVal(node, "value")}${rawVal(node, "unit")}`);
}
class Stringifier {
    constructor(options) {
        this.options = Object.assign({
            autofix: false,
        }, options || {});
    }
    stringify(node) {
        return this[node.type](node);
    }
    Root(node) {
        let s = "";
        for (const c of node.nodes) {
            s += this.stringify(c);
        }
        s += raw(node, "after");
        return s;
    }
    Function(node) {
        let s = `${node.name}(`;
        for (const c of node.nodes) {
            s += this.stringify(c);
        }
        s += raw(node, "beforeClose");
        if (this.options.autofix || !node.unclosed) {
            s += ")";
        }
        return wrapRaws(node, s);
    }
    Parentheses(node) {
        let s = "(";
        for (const c of node.nodes) {
            s += this.stringify(c);
        }
        s += raw(node, "beforeClose");
        if (this.options.autofix || !node.unclosed) {
            s += ")";
        }
        return wrapRaws(node, s);
    }
    MathExpression(node) {
        let beforeLeft = "";
        let between = raw(node, "between");
        let beforeRight = "";
        let afterRight = "";
        if (this.options.autofix) {
            if (!between) {
                between = " ";
            }
            if (!node.right.raws.before) {
                beforeRight = " ";
            }
            if (node.left.type === "MathExpression") {
                if ((node.left.operator === "+" ||
                    node.left.operator === "-") &&
                    (node.operator === "*" || node.operator === "/")) {
                    beforeLeft += "(";
                    between = `)${between}`;
                }
            }
            if (node.right.type === "MathExpression") {
                if ((node.operator === "+" && node.right.operator === "-") ||
                    ((node.operator === "-" || node.operator === "*") &&
                        (node.right.operator === "+" ||
                            node.right.operator === "-")) ||
                    node.operator === "/") {
                    beforeRight += "(";
                    afterRight = `)${afterRight}`;
                }
            }
        }
        return wrapRaws(node, `${beforeLeft}${this.stringify(node.left)}${between}${node.operator}${beforeRight}${this.stringify(node.right)}${afterRight}`);
    }
    Number(node) {
        return wrapRaws(node, rawVal(node, "value"));
    }
    Punctuator(node) {
        return wrapRaws(node, node.value);
    }
    Word(node) {
        return wrapRaws(node, node.value);
    }
    String(node) {
        return wrapRaws(node, node.value);
    }
    Operator(node) {
        return wrapRaws(node, node.value);
    }
    Length(node) {
        return numWithUnit(node);
    }
    Angle(node) {
        return numWithUnit(node);
    }
    Time(node) {
        return numWithUnit(node);
    }
    Frequency(node) {
        return numWithUnit(node);
    }
    Resolution(node) {
        return numWithUnit(node);
    }
    Percentage(node) {
        return numWithUnit(node);
    }
    Flex(node) {
        return numWithUnit(node);
    }
    word(node) {
        return node.value;
    }
    punctuator(node) {
        return node.value;
    }
    operator(node) {
        return node.value;
    }
    whitespace(node) {
        return node.value;
    }
    comment(node) {
        return node.value;
    }
    string(node) {
        return node.value;
    }
    "inline-comment"(node) {
        return node.value;
    }
}
exports.Stringifier = Stringifier;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/tokenizer.js":
/*!*****************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/tokenizer.js ***!
  \*****************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const AST = __webpack_require__(/*! ../types/ast */ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/index.js");
const unicode_1 = __webpack_require__(/*! ./util/unicode */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/unicode.js");
function isPunctuator(cc) {
    return cc === unicode_1.LPAREN || cc === unicode_1.RPAREN || cc === unicode_1.COMMA;
}
function maybeNumber(cc) {
    return unicode_1.isDigit(cc) || cc === unicode_1.DOT;
}
function isQuotes(cc) {
    return cc === unicode_1.DQUOTE || cc === unicode_1.SQUOTE;
}
function getRightBracket(cc) {
    if (cc === unicode_1.LPAREN) {
        return unicode_1.RPAREN;
    }
    if (cc === unicode_1.LBRACE) {
        return unicode_1.RBRACE;
    }
    return unicode_1.RBRACKET;
}
class Tokenizer {
    constructor(text, options) {
        this.lastCode = unicode_1.NULL;
        this.rescan = false;
        this.token = null;
        this.lastTokenType = null;
        this.errors = [];
        this.text = text;
        this.offset = -1;
        this.state = "SCAN";
        this.nextTokenOffset = 0;
        this.options = Object.assign({
            allowInlineCommnets: true,
        }, options || {});
    }
    nextToken() {
        while (this.token == null) {
            const cc = this.scan();
            this.state = this[this.state](cc) || "SCAN";
            if (cc === unicode_1.EOF && !this.rescan) {
                break;
            }
        }
        const { token } = this;
        this.token = null;
        return token;
    }
    scan() {
        if (this.rescan) {
            this.rescan = false;
            return this.lastCode;
        }
        return this.next();
    }
    next() {
        if (this.offset < this.text.length) {
            this.offset++;
        }
        if (this.offset >= this.text.length) {
            return (this.lastCode = unicode_1.EOF);
        }
        return (this.lastCode = this.text.charCodeAt(this.offset));
    }
    back() {
        this.rescan = true;
    }
    reportParseError(code) {
        const error = AST.ParseError.fromCode(code, this.offset);
        this.errors.push(error);
    }
    getCode(indexOffset = 0) {
        return this.text.charCodeAt(this.nextTokenOffset + indexOffset);
    }
    commitToken(type, indexOffset = 0) {
        const start = this.nextTokenOffset;
        const offset = this.offset + indexOffset + 1;
        const value = this.text.slice(start, offset);
        this.token = {
            type,
            value,
            source: {
                start: {
                    index: start,
                },
                end: {
                    index: offset,
                },
            },
        };
        this.nextTokenOffset = offset;
        this.lastTokenType = type;
    }
    SCAN(cc) {
        if (unicode_1.isWhitespace(cc)) {
            return "WHITESPACE";
        }
        if (cc === unicode_1.DQUOTE) {
            return "DQUOTE";
        }
        if (cc === unicode_1.SQUOTE) {
            return "SQUOTE";
        }
        if (cc === unicode_1.SLASH) {
            return "SLASH";
        }
        if (cc === unicode_1.MINUS) {
            return "MINUS";
        }
        if (cc === unicode_1.PLUS) {
            return "PLUS";
        }
        if (cc === unicode_1.STAR) {
            this.commitToken("operator");
            return "SCAN";
        }
        if (isPunctuator(cc)) {
            this.commitToken("punctuator");
            return "SCAN";
        }
        if (cc === unicode_1.LBRACKET) {
            return "LBRACKET";
        }
        if (cc === unicode_1.LBRACE) {
            return "LBRACE";
        }
        if (cc === unicode_1.EOF) {
            return "SCAN";
        }
        return "WORD";
    }
    WORD(cc) {
        while (!unicode_1.isWhitespace(cc) &&
            !isPunctuator(cc) &&
            cc !== unicode_1.PLUS &&
            cc !== unicode_1.STAR &&
            cc !== unicode_1.SLASH &&
            !isQuotes(cc) &&
            cc !== unicode_1.EOF) {
            if (cc === unicode_1.MINUS) {
                const st = this.getCode();
                if (maybeNumber(st) ||
                    ((st === unicode_1.MINUS || st === unicode_1.PLUS) &&
                        maybeNumber(this.getCode(1)))) {
                    this.commitToken("word", -1);
                    return "MINUS";
                }
            }
            else if (cc === unicode_1.LBRACE || cc === unicode_1.LBRACKET || cc === unicode_1.LPAREN) {
                this.skipBrakets(this.next(), getRightBracket(cc));
            }
            cc = this.next();
        }
        this.commitToken("word", -1);
        this.back();
    }
    LBRACKET(cc) {
        this.skipBrakets(cc, unicode_1.RBRACKET);
        return "WORD";
    }
    LBRACE(cc) {
        this.skipBrakets(cc, unicode_1.RBRACE);
        return "WORD";
    }
    WHITESPACE(cc) {
        while (unicode_1.isWhitespace(cc)) {
            cc = this.next();
        }
        this.commitToken("whitespace", -1);
        this.back();
    }
    SLASH(cc) {
        if (cc === unicode_1.STAR) {
            return "COMMENT";
        }
        if (cc === unicode_1.SLASH && this.options.allowInlineCommnets) {
            return "INLINE_COMMENT";
        }
        this.commitToken("operator", -1);
        this.back();
    }
    COMMENT(cc) {
        while (cc !== unicode_1.EOF) {
            if (cc === unicode_1.STAR) {
                cc = this.next();
                if (cc === unicode_1.SLASH) {
                    this.commitToken("comment");
                    return;
                }
            }
            cc = this.next();
        }
        this.commitToken("comment", -1);
        this.reportParseError("eof-in-comment");
    }
    INLINE_COMMENT(cc) {
        while (cc !== unicode_1.EOF) {
            if (cc === unicode_1.LF || cc === unicode_1.FF) {
                this.commitToken("inline-comment");
                return;
            }
            if (cc === unicode_1.CR) {
                cc = this.next();
                if (cc === unicode_1.LF) {
                    this.commitToken("inline-comment");
                    return;
                }
                this.commitToken("inline-comment", -1);
                return this.back();
            }
            cc = this.next();
        }
        this.commitToken("inline-comment", -1);
    }
    MINUS(cc) {
        if (this.lastTokenType === "word" ||
            cc === unicode_1.EOF ||
            (cc !== unicode_1.MINUS && !maybeNumber(cc) && !unicode_1.isLetter(cc))) {
            this.commitToken("operator", -1);
            this.back();
            return;
        }
        return "WORD";
    }
    PLUS(cc) {
        if (this.lastTokenType !== "word") {
            if (maybeNumber(cc)) {
                return "WORD";
            }
        }
        this.commitToken("operator", -1);
        this.back();
    }
    DQUOTE(cc) {
        this.skipString(cc, unicode_1.DQUOTE);
    }
    SQUOTE(cc) {
        this.skipString(cc, unicode_1.SQUOTE);
    }
    skipBrakets(cc, end) {
        const closeStack = [];
        while (cc !== unicode_1.EOF) {
            if (end === cc) {
                const nextTargetBracket = closeStack.pop() || null;
                if (!nextTargetBracket) {
                    return;
                }
                end = nextTargetBracket;
            }
            else if (cc === unicode_1.LBRACE || cc === unicode_1.LBRACKET || cc === unicode_1.LPAREN) {
                if (end) {
                    closeStack.push(end);
                }
                end = getRightBracket(cc);
            }
            cc = this.next();
        }
        this.reportParseError("eof-in-bracket");
    }
    skipString(cc, end) {
        while (cc !== unicode_1.EOF) {
            if (cc === unicode_1.BACKSLASH) {
                cc = this.next();
            }
            else if (cc === end) {
                this.commitToken("string");
                return;
            }
            cc = this.next();
        }
        this.commitToken("string", -1);
        this.reportParseError("eof-in-string");
    }
}
exports.Tokenizer = Tokenizer;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/calc-notation.js":
/*!**************************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/calc-notation.js ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const RE_CALC = /^(-(webkit|mox)-)?calc/iu;
const RE_MIN = /^(-(webkit|mox)-)?min/iu;
const RE_MAX = /^(-(webkit|mox)-)?max/iu;
const RE_CLAMP = /^(-(webkit|mox)-)?clamp/iu;
function isCalc(name) {
    return RE_CALC.test(name);
}
exports.isCalc = isCalc;
function isMin(name) {
    return RE_MIN.test(name);
}
exports.isMin = isMin;
function isMax(name) {
    return RE_MAX.test(name);
}
exports.isMax = isMax;
function isClamp(name) {
    return RE_CLAMP.test(name);
}
exports.isClamp = isClamp;
function isMathFunction(name) {
    return isCalc(name) || isClamp(name) || isMin(name) || isMax(name);
}
exports.isMathFunction = isMathFunction;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/node-impl.js":
/*!**********************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/node-impl.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const stringifier_1 = __webpack_require__(/*! ../stringifier */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/stringifier.js");
let defaultStringifier = null;
class Node {
    constructor() {
        this.parent = null;
    }
    toString(stringifier) {
        if (typeof stringifier === "function") {
            return stringifier(this);
        }
        return (stringifier ||
            defaultStringifier ||
            (defaultStringifier = new stringifier_1.Stringifier())).stringify(this);
    }
    walk(type, callback) {
        const node = this;
        let result = undefined;
        const nodes = [...(node.nodes || []), node.left, node.right].filter(n => Boolean(n));
        const check = typeof type === "string"
            ? (n) => n.type === type
            : (n) => type.test(n.type);
        for (const child of nodes) {
            if (check(child)) {
                result = callback(child);
                if (result === false) {
                    break;
                }
            }
            if (child.walk) {
                result = child.walk(type, callback);
                if (result === false) {
                    break;
                }
            }
        }
        return result;
    }
}
class Container extends Node {
    push(...children) {
        for (const child of children) {
            if (child.type === "Root") {
                this.push(...child.nodes);
            }
            else {
                child.parent = this;
                this.nodes.push(child);
            }
        }
        return this;
    }
    unshift(...children) {
        for (const child of children.reverse()) {
            if (child.type === "Root") {
                this.unshift(...child.nodes);
            }
            else {
                child.parent = this;
                this.nodes.unshift(child);
            }
        }
        return this;
    }
    append(...children) {
        return this.push(...children);
    }
    prepend(...children) {
        return this.unshift(...children);
    }
    insertBefore(exist, add) {
        if (add.type === "Root") {
            const { nodes } = add;
            if (nodes.length === 1) {
                return this.insertBefore(exist, nodes[0]);
            }
            throw new Error("The given Root node is illegal.");
        }
        const existIndex = this.nodes.indexOf(exist);
        if (existIndex < 0) {
            throw new Error("The given node could not be found.");
        }
        add.parent = this;
        this.nodes.splice(existIndex, 0, add);
        return this;
    }
    insertAfter(exist, add) {
        if (add.type === "Root") {
            const { nodes } = add;
            if (nodes.length === 1) {
                return this.insertAfter(exist, nodes[0]);
            }
            throw new Error("The given Root node is illegal.");
        }
        const existIndex = this.nodes.indexOf(exist);
        if (existIndex < 0) {
            throw new Error("The given node could not be found.");
        }
        add.parent = this;
        this.nodes.splice(existIndex + 1, 0, add);
        return this;
    }
    removeAll() {
        for (const node of this.nodes) {
            node.parent = null;
        }
        this.nodes = [];
        return this;
    }
    removeChild(child) {
        const index = this.nodes.indexOf(child);
        this.nodes[index].parent = null;
        this.nodes.splice(index, 1);
        return this;
    }
    get first() {
        return this.nodes[0] || null;
    }
    get last() {
        return this.nodes[this.nodes.length - 1] || null;
    }
}
class NumberValue extends Node {
    constructor(value, before, source) {
        super();
        const num = parseFloat(value);
        this.type = "Number";
        this.value = num;
        this.raws = {
            before,
            value: {
                raw: value,
                value: num,
            },
        };
        this.source = source;
    }
}
exports.NumberValue = NumberValue;
class NumWithUnitValue extends Node {
    constructor(type, value, unit, before, source) {
        super();
        const num = parseFloat(value);
        this.type = type;
        this.value = num;
        this.unit = unit;
        this.raws = {
            before,
            value: {
                raw: value,
                value: num,
            },
        };
        this.source = source;
    }
}
class LengthValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Length", value, unit, before, source);
    }
}
exports.LengthValue = LengthValue;
class AngleValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Angle", value, unit, before, source);
    }
}
exports.AngleValue = AngleValue;
class TimeValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Time", value, unit, before, source);
    }
}
exports.TimeValue = TimeValue;
class FrequencyValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Frequency", value, unit, before, source);
    }
}
exports.FrequencyValue = FrequencyValue;
class ResolutionValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Resolution", value, unit, before, source);
    }
}
exports.ResolutionValue = ResolutionValue;
class PercentageValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Percentage", value, unit, before, source);
    }
}
exports.PercentageValue = PercentageValue;
class FlexValue extends NumWithUnitValue {
    constructor(value, unit, before, source) {
        super("Flex", value, unit, before, source);
    }
}
exports.FlexValue = FlexValue;
class TokenValue extends Node {
    constructor(type, value, before, source) {
        super();
        this.type = type;
        this.value = value;
        this.raws = {
            before,
        };
        this.source = source;
    }
}
class Word extends TokenValue {
    constructor(value, before, source) {
        super("Word", value, before, source);
    }
}
exports.Word = Word;
class StringNode extends TokenValue {
    constructor(value, before, source) {
        super("String", value, before, source);
    }
}
exports.StringNode = StringNode;
function defineAssessor(obj, name, setterProc) {
    const localName = Symbol(`${name}`);
    Object.defineProperties(obj, {
        [localName]: { writable: true, enumerable: false },
        [name]: {
            get() {
                return this[localName];
            },
            set(n) {
                const o = this[localName];
                this[localName] = setterProc(n, o);
            },
            enumerable: true,
        },
    });
}
class MathExpression extends Node {
    constructor(left, operator, right, before, source) {
        super();
        const ope = operator.value;
        const between = operator.raws.before;
        this.type = "MathExpression";
        const setterProc = (n, o) => {
            let e;
            if (n.type === "Root") {
                const { nodes } = n;
                if (nodes.length === 1) {
                    e = nodes[0];
                }
                else {
                    throw new Error("The given Root node is illegal.");
                }
            }
            else {
                e = n;
            }
            e.parent = this;
            if (o) {
                o.parent = null;
            }
            return e;
        };
        defineAssessor(this, "left", setterProc);
        this.left = left;
        this.operator = ope;
        defineAssessor(this, "right", setterProc);
        this.right = right;
        this.raws = { before, between };
        this.source = source;
    }
}
exports.MathExpression = MathExpression;
class FunctionNode extends Container {
    constructor(name, before, source) {
        super();
        this.type = "Function";
        this.name = name;
        this.nodes = [];
        this.raws = { before };
        this.source = source;
    }
}
exports.FunctionNode = FunctionNode;
class Parentheses extends Container {
    constructor(before, source) {
        super();
        this.type = "Parentheses";
        this.nodes = [];
        this.raws = { before };
        this.source = source;
    }
}
exports.Parentheses = Parentheses;
class Punctuator extends TokenValue {
    constructor(value, before, source) {
        super("Punctuator", value, before, source);
    }
}
exports.Punctuator = Punctuator;
class Root extends Container {
    constructor(source) {
        super();
        this.type = "Root";
        this.nodes = [];
        this.tokens = [];
        this.errors = [];
        this.raws = { after: "" };
        this.source = source;
    }
}
exports.Root = Root;
class Operator extends TokenValue {
    constructor(value, before, source) {
        super("Operator", value, before, source);
    }
}
exports.Operator = Operator;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/unicode.js":
/*!********************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/unicode.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.EOF = -1;
exports.NULL = 0x00;
exports.TAB = 0x09;
exports.CR = 0x0d;
exports.LF = 0x0a;
exports.FF = 0x0c;
exports.SPACE = 0x20;
exports.DQUOTE = 0x22;
exports.SQUOTE = 0x27;
exports.LPAREN = 0x28;
exports.RPAREN = 0x29;
exports.STAR = 0x2a;
exports.PLUS = 0x2b;
exports.COMMA = 0x2c;
exports.MINUS = 0x2d;
exports.DOT = 0x2e;
exports.SLASH = 0x2f;
exports.LBRACKET = 0x5b;
exports.BACKSLASH = 0x5c;
exports.RBRACKET = 0x5d;
exports.LBRACE = 0x7b;
exports.RBRACE = 0x7d;
function isWhitespace(cc) {
    return cc === exports.TAB || cc === exports.LF || cc === exports.FF || cc === exports.CR || cc === exports.SPACE;
}
exports.isWhitespace = isWhitespace;
function isDigit(cc) {
    return cc >= 0x30 && cc <= 0x39;
}
exports.isDigit = isDigit;
function isLetter(cc) {
    return ((cc >= 0x61 && cc <= 0x7a) ||
        (cc >= 0x41 && cc <= 0x5a));
}
exports.isLetter = isLetter;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/utils.js":
/*!******************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/css-calc/util/utils.js ***!
  \******************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
function isComma(node) {
    return node.type === "Punctuator" && node.value === ",";
}
exports.isComma = isComma;
function getFunctionArguments(fn) {
    const { nodes } = fn;
    const first = nodes[0];
    if (!first || isComma(first)) {
        return null;
    }
    const result = [first];
    const length = nodes.length;
    for (let index = 1; index < length; index++) {
        const comma = nodes[index++];
        if (!isComma(comma)) {
            return null;
        }
        const arg = nodes[index];
        if (!arg || isComma(arg)) {
            return null;
        }
        result.push(arg);
    }
    return result;
}
exports.getFunctionArguments = getFunctionArguments;


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/index.js":
/*!****************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/index.js ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const AST = __webpack_require__(/*! ./types/ast */ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/index.js");
exports.AST = AST;
const css_calc_1 = __webpack_require__(/*! ./css-calc */ "../../node_modules/postcss-calc-ast-parser/dist/css-calc/index.js");
exports.Parser = css_calc_1.Parser;
exports.Tokenizer = css_calc_1.Tokenizer;
exports.Stringifier = css_calc_1.Stringifier;
exports.getResolvedType = css_calc_1.getResolvedType;
exports.reduceExpression = css_calc_1.reduceExpression;
exports.mathExpr = css_calc_1.newMathExpression;
function parse(code, options) {
    const tokenizer = new css_calc_1.Tokenizer(code, options);
    return new css_calc_1.Parser(tokenizer, options).parse();
}
exports.parse = parse;
function stringify(node, options) {
    const stringifier = new css_calc_1.Stringifier(options);
    return stringifier.stringify(node);
}
exports.stringify = stringify;
exports["default"] = {
    parse,
    stringify,
    getResolvedType: css_calc_1.getResolvedType,
    reduceExpression: css_calc_1.reduceExpression,
    mathExpr: css_calc_1.newMathExpression,
    Parser: css_calc_1.Parser,
    Tokenizer: css_calc_1.Tokenizer,
    Stringifier: css_calc_1.Stringifier,
    AST,
};


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/errors.js":
/*!***************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/types/ast/errors.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class ParseError extends SyntaxError {
    static fromCode(code, offset) {
        return new ParseError(MESSAGES[code], code, offset);
    }
    constructor(message, code, offset) {
        super(message);
        this.code = code;
        this.index = offset;
    }
}
exports.ParseError = ParseError;
const MESSAGES = {
    "eof-in-string": "Unclosed string",
    "eof-in-comment": "Unclosed comment",
    "eof-in-bracket": "Unclosed bracket",
    "unexpected-parenthesis": "Unexpected token",
    "unexpected-calc-token": "Unexpected token",
};


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/index.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/dist/types/ast/index.js ***!
  \**************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", ({ value: true }));
__export(__webpack_require__(/*! ./errors */ "../../node_modules/postcss-calc-ast-parser/dist/types/ast/errors.js"));


/***/ }),

/***/ "../../node_modules/postcss-calc-ast-parser/node_modules/postcss-value-parser/lib/unit.js":
/*!************************************************************************************************!*\
  !*** ../../node_modules/postcss-calc-ast-parser/node_modules/postcss-value-parser/lib/unit.js ***!
  \************************************************************************************************/
/***/ ((module) => {

var minus = "-".charCodeAt(0);
var plus = "+".charCodeAt(0);
var dot = ".".charCodeAt(0);
var exp = "e".charCodeAt(0);
var EXP = "E".charCodeAt(0);

module.exports = function(value) {
  var pos = 0;
  var length = value.length;
  var dotted = false;
  var sciPos = -1;
  var containsNumber = false;
  var code;

  while (pos < length) {
    code = value.charCodeAt(pos);

    if (code >= 48 && code <= 57) {
      containsNumber = true;
    } else if (code === exp || code === EXP) {
      if (sciPos > -1) {
        break;
      }
      sciPos = pos;
    } else if (code === dot) {
      if (dotted) {
        break;
      }
      dotted = true;
    } else if (code === plus || code === minus) {
      if (pos !== 0) {
        break;
      }
    } else {
      break;
    }

    pos += 1;
  }

  if (sciPos + 1 === pos) pos--;

  return containsNumber
    ? {
        number: value.slice(0, pos),
        unit: value.slice(pos)
      }
    : false;
};


/***/ }),

/***/ "./src/app/components/createTokenObj.tsx":
/*!***********************************************!*\
  !*** ./src/app/components/createTokenObj.tsx ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appendTypeToToken: () => (/* binding */ appendTypeToToken),
/* harmony export */   createTokensObject: () => (/* binding */ createTokensObject),
/* harmony export */   mappedTokens: () => (/* binding */ mappedTokens),
/* harmony export */   transformName: () => (/* binding */ transformName)
/* harmony export */ });
/* harmony import */ var set_value__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! set-value */ "./node_modules/set-value/index.js");
/* harmony import */ var set_value__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(set_value__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var just_extend__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! just-extend */ "../../node_modules/just-extend/index.mjs");
/* harmony import */ var _config_tokenType_defs_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../config/tokenType.defs.json */ "./src/config/tokenType.defs.json");
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}




function transformName(name) {
    switch(name){
        case "color":
        case "colors":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.COLOR;
        case "space":
        case "spacing":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.SPACING;
        case "size":
        case "sizing":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.SIZING;
        case "boxShadow":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.BOX_SHADOW;
        case "borderRadius":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.BORDER_RADIUS;
        case "borderWidth":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.BORDER_WIDTH;
        case "opacity":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.OPACITY;
        case "fontFamilies":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.FONT_FAMILIES;
        case "fontWeights":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.FONT_WEIGHTS;
        case "fontSizes":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.FONT_SIZES;
        case "lineHeights":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.LINE_HEIGHTS;
        case "typography":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.TYPOGRAPHY;
        case "letterSpacing":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.LETTER_SPACING;
        case "paragraphSpacing":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.PARAGRAPH_SPACING;
        case "composition":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.COMPOSITION;
        case "border":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.BORDER;
        case "asset":
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.ASSET;
        default:
            return _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_3__.TokenTypes.OTHER;
    }
}
function appendTypeToToken(token) {
    var typeToSet = token.type ? token.type : transformName(token.name.split(".").slice(0, 1).toString());
    return _object_spread_props(_object_spread({}, token), {
        type: typeToSet
    });
}
// Creates a tokens object so that tokens are displayed in groups in the UI.
function createTokensObject(tokens) {
    var tokenFilter = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : "";
    if (tokens.length > 0) {
        var obj = tokens.reduce(function(acc, cur) {
            var hasSubstring = false;
            try {
                var _cur_name;
                hasSubstring = ((_cur_name = cur.name) === null || _cur_name === void 0 ? void 0 : _cur_name.toLowerCase().search(tokenFilter === null || tokenFilter === void 0 ? void 0 : tokenFilter.toLowerCase())) >= 0;
            } catch (e) {
                var _cur_name1;
                hasSubstring = ((_cur_name1 = cur.name) === null || _cur_name1 === void 0 ? void 0 : _cur_name1.indexOf(tokenFilter)) >= 0;
            }
            if (tokenFilter === "" || hasSubstring) {
                var _acc_propToSet;
                var propToSet = cur.type ? cur.type : transformName(cur.name.split(".").slice(0, 1).toString());
                if (!((_acc_propToSet = acc[propToSet]) === null || _acc_propToSet === void 0 ? void 0 : _acc_propToSet.values)) {
                    acc[propToSet] = {
                        values: {}
                    };
                }
                // we can use ! here because in the previous block we are ensuring
                // the values object exists
                set_value__WEBPACK_IMPORTED_MODULE_0___default()(acc[propToSet].values, cur.name, (0,just_extend__WEBPACK_IMPORTED_MODULE_1__["default"])(true, {}, cur));
            }
            return acc;
        }, {});
        return obj;
    }
    return {};
}
// Takes an array of tokens, transforms them into
// an object and merges that with values we require for the UI
function mappedTokens(tokens, tokenFilter) {
    var tokenObj = (0,just_extend__WEBPACK_IMPORTED_MODULE_1__["default"])(true, {}, _config_tokenType_defs_json__WEBPACK_IMPORTED_MODULE_2__);
    var tokenObjects = createTokensObject(tokens, tokenFilter);
    Object.entries(tokenObjects).forEach(function(param) {
        var _param = _sliced_to_array(param, 2), key = _param[0], group = _param[1];
        var _tokenObj_key;
        tokenObj[key] = _object_spread_props(_object_spread({}, (_tokenObj_key = tokenObj[key]) !== null && _tokenObj_key !== void 0 ? _tokenObj_key : {}), {
            values: group.values
        });
    });
    return Object.entries(tokenObj);
}


/***/ }),

/***/ "./src/constants/AliasRegex.ts":
/*!*************************************!*\
  !*** ./src/constants/AliasRegex.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AliasDollarRegex: () => (/* binding */ AliasDollarRegex),
/* harmony export */   AliasRegex: () => (/* binding */ AliasRegex),
/* harmony export */   checkAliasStartRegex: () => (/* binding */ checkAliasStartRegex)
/* harmony export */ });
// evaluates start of alias tokens such as $foo or {foo
var checkAliasStartRegex = /(\$[^\s,]+\w)|({([^]*))/g;
// evaluates tokens such as $foo or {foo}
var AliasRegex = /\{((?:[^{}]|{[^{}]*})*)\}|(?:\$([^\s,]+\w))/g;
var AliasDollarRegex = /(?:\$([^\s,]+\w))/g;


/***/ }),

/***/ "./src/constants/BoxShadowTypes.ts":
/*!*****************************************!*\
  !*** ./src/constants/BoxShadowTypes.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BoxShadowTypes: () => (/* binding */ BoxShadowTypes)
/* harmony export */ });
var BoxShadowTypes;
(function(BoxShadowTypes) {
    BoxShadowTypes["DROP_SHADOW"] = "dropShadow";
    BoxShadowTypes["INNER_SHADOW"] = "innerShadow";
})(BoxShadowTypes || (BoxShadowTypes = {}));


/***/ }),

/***/ "./src/constants/ColorModifierTypes.ts":
/*!*********************************************!*\
  !*** ./src/constants/ColorModifierTypes.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorModifierTypes: () => (/* binding */ ColorModifierTypes)
/* harmony export */ });
var ColorModifierTypes;
(function(ColorModifierTypes) {
    ColorModifierTypes["LIGHTEN"] = "lighten";
    ColorModifierTypes["DARKEN"] = "darken";
    ColorModifierTypes["MIX"] = "mix";
    ColorModifierTypes["ALPHA"] = "alpha";
})(ColorModifierTypes || (ColorModifierTypes = {}));


/***/ }),

/***/ "./src/constants/ColorSpaceTypes.ts":
/*!******************************************!*\
  !*** ./src/constants/ColorSpaceTypes.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorSpaceTypes: () => (/* binding */ ColorSpaceTypes)
/* harmony export */ });
var ColorSpaceTypes;
(function(ColorSpaceTypes) {
    ColorSpaceTypes["LCH"] = "lch";
    ColorSpaceTypes["SRGB"] = "srgb";
    ColorSpaceTypes["P3"] = "p3";
    ColorSpaceTypes["HSL"] = "hsl";
})(ColorSpaceTypes || (ColorSpaceTypes = {}));


/***/ }),

/***/ "./src/constants/Properties.ts":
/*!*************************************!*\
  !*** ./src/constants/Properties.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Properties: () => (/* binding */ Properties)
/* harmony export */ });
var Properties;
(function(Properties) {
    Properties["sizing"] = "sizing";
    Properties["height"] = "height";
    Properties["width"] = "width";
    Properties["minWidth"] = "minWidth";
    Properties["maxWidth"] = "maxWidth";
    Properties["minHeight"] = "minHeight";
    Properties["maxHeight"] = "maxHeight";
    Properties["spacing"] = "spacing";
    Properties["verticalPadding"] = "verticalPadding";
    Properties["horizontalPadding"] = "horizontalPadding";
    Properties["counterAxisSpacing"] = "counterAxisSpacing";
    Properties["paddingTop"] = "paddingTop";
    Properties["paddingRight"] = "paddingRight";
    Properties["paddingBottom"] = "paddingBottom";
    Properties["paddingLeft"] = "paddingLeft";
    Properties["itemSpacing"] = "itemSpacing";
    Properties["fill"] = "fill";
    Properties["backgroundBlur"] = "backgroundBlur";
    Properties["border"] = "border";
    Properties["borderTop"] = "borderTop";
    Properties["borderRight"] = "borderRight";
    Properties["borderBottom"] = "borderBottom";
    Properties["borderLeft"] = "borderLeft";
    Properties["borderColor"] = "borderColor";
    Properties["borderRadius"] = "borderRadius";
    Properties["borderRadiusTopLeft"] = "borderRadiusTopLeft";
    Properties["borderRadiusTopRight"] = "borderRadiusTopRight";
    Properties["borderRadiusBottomRight"] = "borderRadiusBottomRight";
    Properties["borderRadiusBottomLeft"] = "borderRadiusBottomLeft";
    Properties["borderWidth"] = "borderWidth";
    Properties["borderWidthTop"] = "borderWidthTop";
    Properties["borderWidthRight"] = "borderWidthRight";
    Properties["borderWidthBottom"] = "borderWidthBottom";
    Properties["borderWidthLeft"] = "borderWidthLeft";
    Properties["boxShadow"] = "boxShadow";
    Properties["opacity"] = "opacity";
    Properties["fontFamilies"] = "fontFamilies";
    Properties["fontWeights"] = "fontWeights";
    Properties["fontSizes"] = "fontSizes";
    Properties["lineHeights"] = "lineHeights";
    Properties["typography"] = "typography";
    Properties["composition"] = "composition";
    Properties["letterSpacing"] = "letterSpacing";
    Properties["paragraphSpacing"] = "paragraphSpacing";
    Properties["textCase"] = "textCase";
    Properties["dimension"] = "dimension";
    Properties["textDecoration"] = "textDecoration";
    Properties["asset"] = "asset";
    Properties["visibility"] = "visibility";
    Properties["text"] = "text";
    Properties["number"] = "number";
    Properties["tokenValue"] = "tokenValue";
    Properties["value"] = "value";
    Properties["tokenName"] = "tokenName";
    Properties["description"] = "description";
    Properties["rotation"] = "rotation";
    Properties["x"] = "x";
    Properties["y"] = "y";
})(Properties || (Properties = {}));


/***/ }),

/***/ "./src/constants/StorageProviderType.ts":
/*!**********************************************!*\
  !*** ./src/constants/StorageProviderType.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StorageProviderType: () => (/* binding */ StorageProviderType)
/* harmony export */ });
var StorageProviderType;
(function(StorageProviderType) {
    StorageProviderType["LOCAL"] = "local";
    StorageProviderType["GENERIC_VERSIONED_STORAGE"] = "genericVersionedStorage";
    StorageProviderType["JSONBIN"] = "jsonbin";
    StorageProviderType["GITHUB"] = "github";
    StorageProviderType["GITLAB"] = "gitlab";
    StorageProviderType["SUPERNOVA"] = "supernova";
    StorageProviderType["ADO"] = "ado";
    StorageProviderType["URL"] = "url";
    StorageProviderType["BITBUCKET"] = "bitbucket";
    StorageProviderType["TOKENS_STUDIO"] = "tokensstudio";
})(StorageProviderType || (StorageProviderType = {}));


/***/ }),

/***/ "./src/constants/TokenSetStatus.ts":
/*!*****************************************!*\
  !*** ./src/constants/TokenSetStatus.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TokenSetStatus: () => (/* binding */ TokenSetStatus)
/* harmony export */ });
var TokenSetStatus;
(function(TokenSetStatus) {
    TokenSetStatus["DISABLED"] = "disabled";
    TokenSetStatus["SOURCE"] = "source";
    TokenSetStatus["ENABLED"] = "enabled";
})(TokenSetStatus || (TokenSetStatus = {}));


/***/ }),

/***/ "./src/constants/TokenTypes.ts":
/*!*************************************!*\
  !*** ./src/constants/TokenTypes.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ExportNumberVariablesTokenTypes: () => (/* binding */ ExportNumberVariablesTokenTypes),
/* harmony export */   TokenTypes: () => (/* binding */ TokenTypes)
/* harmony export */ });
var TokenTypes;
(function(TokenTypes) {
    TokenTypes["OTHER"] = "other";
    TokenTypes["COLOR"] = "color";
    TokenTypes["BORDER_RADIUS"] = "borderRadius";
    TokenTypes["SIZING"] = "sizing";
    TokenTypes["SPACING"] = "spacing";
    TokenTypes["TEXT"] = "text";
    TokenTypes["TYPOGRAPHY"] = "typography";
    TokenTypes["OPACITY"] = "opacity";
    TokenTypes["BORDER_WIDTH"] = "borderWidth";
    TokenTypes["BOX_SHADOW"] = "boxShadow";
    TokenTypes["FONT_FAMILIES"] = "fontFamilies";
    TokenTypes["FONT_WEIGHTS"] = "fontWeights";
    TokenTypes["LINE_HEIGHTS"] = "lineHeights";
    TokenTypes["FONT_SIZES"] = "fontSizes";
    TokenTypes["LETTER_SPACING"] = "letterSpacing";
    TokenTypes["PARAGRAPH_SPACING"] = "paragraphSpacing";
    TokenTypes["PARAGRAPH_INDENT"] = "paragraphIndent";
    TokenTypes["TEXT_DECORATION"] = "textDecoration";
    TokenTypes["TEXT_CASE"] = "textCase";
    TokenTypes["COMPOSITION"] = "composition";
    TokenTypes["DIMENSION"] = "dimension";
    TokenTypes["BORDER"] = "border";
    TokenTypes["ASSET"] = "asset";
    TokenTypes["BOOLEAN"] = "boolean";
    TokenTypes["NUMBER"] = "number";
})(TokenTypes || (TokenTypes = {}));
var ExportNumberVariablesTokenTypes = [
    "borderRadius",
    "sizing",
    "spacing",
    "borderWidth",
    "dimension",
    "number",
    "fontSizes",
    "letterSpacing",
    "lineHeights",
    "paragraphIndent",
    "paragraphSpacing",
    "opacity"
];


/***/ }),

/***/ "./src/plugin/TokenFormatStoreClass.ts":
/*!*********************************************!*\
  !*** ./src/plugin/TokenFormatStoreClass.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TOKEN_FORMAT_OPTIONS: () => (/* binding */ TOKEN_FORMAT_OPTIONS),
/* harmony export */   TokenFormat: () => (/* binding */ TokenFormat),
/* harmony export */   TokenFormatOptions: () => (/* binding */ TokenFormatOptions),
/* harmony export */   TokenFormatStoreClass: () => (/* binding */ TokenFormatStoreClass),
/* harmony export */   getFormat: () => (/* binding */ getFormat),
/* harmony export */   setFormat: () => (/* binding */ setFormat)
/* harmony export */ });
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
var TokenFormatOptions;
(function(TokenFormatOptions) {
    TokenFormatOptions["DTCG"] = "dtcg";
    TokenFormatOptions["Legacy"] = "legacy";
})(TokenFormatOptions || (TokenFormatOptions = {}));
var _obj;
var TOKEN_FORMAT_OPTIONS = (_obj = {}, _define_property(_obj, "dtcg", {
    label: "DTCG",
    value: "dtcg"
}), _define_property(_obj, "legacy", {
    label: "Legacy",
    value: "legacy"
}), _obj);
var TokenFormatStoreClass = function TokenFormatStoreClass() {
    "use strict";
    var _this = this;
    _class_call_check(this, TokenFormatStoreClass);
    _define_property(this, "tokenValueKey", void 0);
    _define_property(this, "tokenTypeKey", void 0);
    _define_property(this, "tokenDescriptionKey", void 0);
    _define_property(this, "format", void 0);
    _define_property(this, "setFormat", function(format) {
        _this.format = format;
        _this.tokenValueKey = format === "dtcg" ? "$value" : "value";
        _this.tokenTypeKey = format === "dtcg" ? "$type" : "type";
        _this.tokenDescriptionKey = format === "dtcg" ? "$description" : "description";
    });
    _define_property(this, "getFormat", function() {
        return _this.format;
    });
    this.tokenValueKey = "value";
    this.tokenTypeKey = "type";
    this.tokenDescriptionKey = "description";
    this.format = "legacy";
};
var TokenFormat = new TokenFormatStoreClass();
var setFormat = TokenFormat.setFormat, getFormat = TokenFormat.getFormat;


/***/ }),

/***/ "./src/plugin/figmaTransforms/opacity.ts":
/*!***********************************************!*\
  !*** ./src/plugin/figmaTransforms/opacity.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ convertOpacityToFigma)
/* harmony export */ });
function convertOpacityToFigma(value, shouldOutputForVariables) {
    // Matches 50%, 100%, etc.
    var matched = value.match(/(\d+%)/);
    if (matched) {
        var matchedValue = Number(matched[0].slice(0, -1));
        if (shouldOutputForVariables) {
            return matchedValue;
        }
        return matchedValue / 100;
    }
    // Figma expects floats to be between 1 and 100, yet our users can enter opacity as 0-1 as well. We need to create appropriately.
    var numericValue = Number(value);
    if (shouldOutputForVariables && numericValue >= 0 && numericValue <= 1) {
        return numericValue * 100;
    }
    return numericValue;
}


/***/ }),

/***/ "./src/utils/TokenResolver.ts":
/*!************************************!*\
  !*** ./src/utils/TokenResolver.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defaultTokenResolver: () => (/* binding */ defaultTokenResolver)
/* harmony export */ });
/* harmony import */ var js_yaml__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! js-yaml */ "./node_modules/js-yaml/dist/js-yaml.mjs");
/* harmony import */ var _constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/constants/AliasRegex */ "./src/constants/AliasRegex.ts");
/* harmony import */ var _math__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./math */ "./src/utils/math/index.ts");
/* harmony import */ var _color__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./color */ "./src/utils/color/index.ts");
/* harmony import */ var _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/constants/ColorModifierTypes */ "./src/constants/ColorModifierTypes.ts");
/* harmony import */ var _convertModifiedColorToHex__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./convertModifiedColorToHex */ "./src/utils/convertModifiedColorToHex.ts");
/* harmony import */ var _getPathName__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./getPathName */ "./src/utils/getPathName.ts");
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}







var TokenResolver = /*#__PURE__*/ function() {
    "use strict";
    function TokenResolver(tokens) {
        _class_call_check(this, TokenResolver);
        _define_property(this, "tokens", void 0);
        _define_property(this, "tokenMap", void 0);
        _define_property(this, "memo", void 0);
        this.tokens = tokens;
        this.tokenMap = new Map();
        this.memo = new Map();
        this.populateTokenMap();
    }
    _create_class(TokenResolver, [
        {
            key: "populateTokenMap",
            value: // Set tokens and populate token map
            function populateTokenMap() {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = this.tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var token = _step.value;
                        this.tokenMap.set(token.name, token);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        },
        {
            key: "setTokens",
            value: // When we get new tokens, we need to update the token map
            function setTokens(tokens) {
                this.tokens = tokens;
                this.tokenMap = new Map();
                this.memo = new Map();
                this.populateTokenMap();
                return this.resolveTokenValues();
            }
        },
        {
            key: "resolveTokenValues",
            value: // Initial function to iterate over all tokens and resolve references
            function resolveTokenValues() {
                var resolvedTokens = [];
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = this.tokens[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var token = _step.value;
                        var resolvedValue = this.resolveReferences(token);
                        if (typeof resolvedValue.value === "string" && _constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__.AliasRegex.test(resolvedValue.value)) {
                            resolvedValue.failedToResolve = true;
                        }
                        resolvedTokens.push(_object_spread_props(_object_spread({}, resolvedValue), {
                            rawValue: token.value
                        }));
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return resolvedTokens;
            }
        },
        {
            key: "isExponentialAndZero",
            value: function isExponentialAndZero(str) {
                var regex = /^[+-]?\d*\.?\d+([eE][+-]?\d+)?$/;
                var numericRegex = /^[+-]?\d*\.?\d+$/;
                // Needs to be more than a single zero otherwise "0" will get evaluated incorrectly
                var allZerosRegex = /^00+$/;
                var leadingZerosRegex = /^0+[1-9]\d*$/;
                return regex.test(str) && !numericRegex.test(str) || allZerosRegex.test(str) || leadingZerosRegex.test(str);
            }
        },
        {
            key: "calculateTokenValue",
            value: // When we resolve references, we also need to calculate the value of the token, meaning color and math transformations
            function calculateTokenValue(token) {
                var resolvedReferences = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : new Set();
                // Calculations only happen on strings.
                if (typeof token.value === "string") {
                    var _token_$extensions_studiotokens, _token_$extensions;
                    var couldBeNumberValue = !this.isExponentialAndZero(token.value) ? (0,_math__WEBPACK_IMPORTED_MODULE_2__.checkAndEvaluateMath)(token.value) : token.value;
                    // if it's a number, we don't need to do anything else and can return it
                    if (typeof couldBeNumberValue === "number") {
                        return couldBeNumberValue;
                    }
                    // Transform non-conform colors such as rgba({color}, 0.5) to hex
                    var rgbColor = (0,_color__WEBPACK_IMPORTED_MODULE_3__.convertToRgb)(couldBeNumberValue);
                    // If we have a color modifier, we need to apply it. As we need chained resolution to happen, this needs to be done here.
                    if (typeof token === "object" && (token === null || token === void 0 ? void 0 : (_token_$extensions = token.$extensions) === null || _token_$extensions === void 0 ? void 0 : (_token_$extensions_studiotokens = _token_$extensions["studio.tokens"]) === null || _token_$extensions_studiotokens === void 0 ? void 0 : _token_$extensions_studiotokens.modify) && rgbColor) {
                        var _token_$extensions_studiotokens_modify, _token_$extensions_studiotokens1, _token_$extensions1, _token_$extensions_studiotokens2, _token_$extensions2, _this_resolveReferences, _token_$extensions_studiotokens_modify1, _token_$extensions_studiotokens3, _token_$extensions3;
                        if ((token === null || token === void 0 ? void 0 : (_token_$extensions1 = token.$extensions) === null || _token_$extensions1 === void 0 ? void 0 : (_token_$extensions_studiotokens1 = _token_$extensions1["studio.tokens"]) === null || _token_$extensions_studiotokens1 === void 0 ? void 0 : (_token_$extensions_studiotokens_modify = _token_$extensions_studiotokens1.modify) === null || _token_$extensions_studiotokens_modify === void 0 ? void 0 : _token_$extensions_studiotokens_modify.type) === _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_4__.ColorModifierTypes.MIX) {
                            var _token_$extensions_studiotokens4, _token_$extensions4, _this_resolveReferences1, _token_$extensions_studiotokens_modify2, _token_$extensions_studiotokens5, _token_$extensions5, _this_resolveReferences2, _token_$extensions_studiotokens_modify3, _token_$extensions_studiotokens6, _token_$extensions6;
                            var _String;
                            // As we support references in color modifiers, we need to resolve them.
                            return (0,_convertModifiedColorToHex__WEBPACK_IMPORTED_MODULE_5__.convertModifiedColorToHex)(rgbColor, _object_spread_props(_object_spread({}, (_token_$extensions4 = token.$extensions) === null || _token_$extensions4 === void 0 ? void 0 : (_token_$extensions_studiotokens4 = _token_$extensions4["studio.tokens"]) === null || _token_$extensions_studiotokens4 === void 0 ? void 0 : _token_$extensions_studiotokens4.modify), {
                                value: String((_this_resolveReferences1 = this.resolveReferences({
                                    value: token === null || token === void 0 ? void 0 : (_token_$extensions5 = token.$extensions) === null || _token_$extensions5 === void 0 ? void 0 : (_token_$extensions_studiotokens5 = _token_$extensions5["studio.tokens"]) === null || _token_$extensions_studiotokens5 === void 0 ? void 0 : (_token_$extensions_studiotokens_modify2 = _token_$extensions_studiotokens5.modify) === null || _token_$extensions_studiotokens_modify2 === void 0 ? void 0 : _token_$extensions_studiotokens_modify2.value
                                }, resolvedReferences)) === null || _this_resolveReferences1 === void 0 ? void 0 : _this_resolveReferences1.value),
                                color: (_String = String((_this_resolveReferences2 = this.resolveReferences({
                                    value: token === null || token === void 0 ? void 0 : (_token_$extensions6 = token.$extensions) === null || _token_$extensions6 === void 0 ? void 0 : (_token_$extensions_studiotokens6 = _token_$extensions6["studio.tokens"]) === null || _token_$extensions_studiotokens6 === void 0 ? void 0 : (_token_$extensions_studiotokens_modify3 = _token_$extensions_studiotokens6.modify) === null || _token_$extensions_studiotokens_modify3 === void 0 ? void 0 : _token_$extensions_studiotokens_modify3.color
                                }, resolvedReferences)) === null || _this_resolveReferences2 === void 0 ? void 0 : _this_resolveReferences2.value)) !== null && _String !== void 0 ? _String : undefined
                            }));
                        }
                        return (0,_convertModifiedColorToHex__WEBPACK_IMPORTED_MODULE_5__.convertModifiedColorToHex)(rgbColor, _object_spread_props(_object_spread({}, (_token_$extensions2 = token.$extensions) === null || _token_$extensions2 === void 0 ? void 0 : (_token_$extensions_studiotokens2 = _token_$extensions2["studio.tokens"]) === null || _token_$extensions_studiotokens2 === void 0 ? void 0 : _token_$extensions_studiotokens2.modify), {
                            value: String((_this_resolveReferences = this.resolveReferences({
                                value: token === null || token === void 0 ? void 0 : (_token_$extensions3 = token.$extensions) === null || _token_$extensions3 === void 0 ? void 0 : (_token_$extensions_studiotokens3 = _token_$extensions3["studio.tokens"]) === null || _token_$extensions_studiotokens3 === void 0 ? void 0 : (_token_$extensions_studiotokens_modify1 = _token_$extensions_studiotokens3.modify) === null || _token_$extensions_studiotokens_modify1 === void 0 ? void 0 : _token_$extensions_studiotokens_modify1.value
                            }, resolvedReferences)) === null || _this_resolveReferences === void 0 ? void 0 : _this_resolveReferences.value)
                        }));
                    }
                    // If we don't have a color modifier, we can just return the color
                    return rgbColor;
                }
                // If it's not a string we just return the value.
                return token.value;
            }
        },
        {
            key: "resolveReferences",
            value: function resolveReferences(token) {
                var resolvedReferences = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : new Set();
                // We use the name as the memo key, if it exists
                var memoKey = token.name || undefined;
                // If we have a cache hit, we can return it
                if (memoKey && this.memo.has(memoKey)) {
                    var cacheResult = this.memo.get(memoKey);
                    if (cacheResult) {
                        return cacheResult;
                    }
                }
                var foundToken;
                // For strings, we need to check if there are any references, as those can only occur in strings
                if (typeof token.value === "string") {
                    var references = token.value.toString().match(_constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__.AliasRegex) || [];
                    var finalValue = token.value;
                    var resolvedValueWithReferences;
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        // Resolve every reference, there could be more than 1, as in "{color.primary} {color.secondary}"
                        for(var _iterator = references[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var reference = _step.value;
                            var path = (0,_getPathName__WEBPACK_IMPORTED_MODULE_6__.getPathName)(reference);
                            // We need to avoid circular references, so we check if we already resolved this reference
                            if (resolvedReferences.has(path)) {
                                return _object_spread_props(_object_spread({}, token), {
                                    rawValue: token.value,
                                    failedToResolve: true
                                });
                            }
                            // Users can nest references, so we need to make sure to resolve any nested references first.
                            var resolvedPath = path;
                            var matches = true;
                            // As long as we have matches, we need to resolve them. This is needed for multiple levels of nesting. Performance will suffer, but that's the user's choice.
                            while(matches !== false){
                                var match = resolvedPath.match(_constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__.AliasRegex);
                                matches = Boolean(match === null || match === void 0 ? void 0 : match.length);
                                if (!(match === null || match === void 0 ? void 0 : match.length)) break;
                                var nestedTokenName = (0,_getPathName__WEBPACK_IMPORTED_MODULE_6__.getPathName)(match[0]);
                                var nestedToken = this.tokenMap.get(nestedTokenName);
                                if (nestedToken && nestedToken.value) {
                                    var resolvedNestedToken = this.resolveReferences(_object_spread_props(_object_spread({}, nestedToken), {
                                        name: nestedTokenName
                                    }), new Set(resolvedReferences));
                                    if (typeof resolvedNestedToken.value === "string" || typeof resolvedNestedToken.value === "number") {
                                        resolvedPath = resolvedPath.replace(match[0], resolvedNestedToken.value);
                                    }
                                } else {
                                    break;
                                }
                            }
                            // We have the special case of deep references where we can reference the .fontFamily property of a typography token.
                            // For that case, we need to split the path and get the last part, which might be the property name.
                            // However, it might not be. If we have a token called "color.primary" and we reference "color.primary.fontFamily", we need to check if "color.primary" exists. If it does, we prefer to return that one.
                            // If it doesn't it might be a composite token where we want to return the atomic property
                            var propertyPath = resolvedPath.split(".");
                            var propertyName = propertyPath.pop();
                            var tokenNameWithoutLastPart = propertyPath.join(".");
                            foundToken = this.tokenMap.get(resolvedPath);
                            if (foundToken) {
                                // For composite tokens that are being referenced, we need to store the value of the found token so that we have something between raw value of a string and the final resolved token
                                if (typeof token.value === "string" && (typeof foundToken.value === "object" || Array.isArray(foundToken.value))) {
                                    resolvedValueWithReferences = foundToken.value;
                                }
                                // We add the already resolved references to the new set, so we can check for circular references
                                var newResolvedReferences = new Set(resolvedReferences);
                                newResolvedReferences.add(resolvedPath);
                                // We initiate a new resolveReferences call, as we need to resolve the references of the reference
                                var resolvedTokenValue = this.resolveReferences(_object_spread_props(_object_spread({}, foundToken), {
                                    name: resolvedPath
                                }), newResolvedReferences);
                                if (resolvedTokenValue.resolvedValueWithReferences) {
                                    resolvedValueWithReferences = resolvedTokenValue.resolvedValueWithReferences;
                                }
                                // We weren't able to resolve the reference, so we return the token as is, but mark it as failed to resolve
                                if (resolvedTokenValue.value === undefined) {
                                    return _object_spread_props(_object_spread({}, token), {
                                        value: token.value,
                                        rawValue: token.value,
                                        failedToResolve: true
                                    });
                                }
                                // We replace the reference with the resolved value if needed
                                if (typeof finalValue === "string" && (typeof resolvedTokenValue.value === "string" || typeof resolvedTokenValue.value === "number")) {
                                    finalValue = finalValue.replace(reference, resolvedTokenValue.value);
                                } else if (resolvedTokenValue.value !== undefined) {
                                    finalValue = resolvedTokenValue.value;
                                }
                            } else {
                                var _this_tokenMap_get;
                                // If we didn't find a value, we need to check if we have a composite token
                                var tokenValueWithoutProperty = (_this_tokenMap_get = this.tokenMap.get(tokenNameWithoutLastPart)) === null || _this_tokenMap_get === void 0 ? void 0 : _this_tokenMap_get.value;
                                if (tokenValueWithoutProperty && tokenValueWithoutProperty.hasOwnProperty(propertyName)) {
                                    var propertyTokenValue = tokenValueWithoutProperty[propertyName];
                                    var parsedValue = this.calculateTokenValue({
                                        value: propertyTokenValue
                                    }, resolvedReferences);
                                    if (parsedValue === undefined) {
                                        finalValue = token.value;
                                    } else {
                                        finalValue = typeof finalValue === "string" && (typeof parsedValue === "string" || typeof parsedValue === "number") ? finalValue.replace(reference, parsedValue) : parsedValue;
                                    }
                                } else {
                                    // Otherwise, we return the token as is, but mark it as failed to resolve
                                    return _object_spread_props(_object_spread({}, token), {
                                        value: token.value,
                                        rawValue: token.value,
                                        failedToResolve: true
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                    var resolvedToken;
                    // When we have a string or number, we need to check if it's a valid token value.
                    if ((typeof finalValue === "string" || typeof finalValue === "number") && !_constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__.AliasRegex.test(finalValue)) {
                        // We need to calculate the value of the token, as it might be a color or math transformation
                        // eslint-disable-next-line @typescript-eslint/no-use-before-define
                        var calculated = this.calculateTokenValue(_object_spread_props(_object_spread({}, token), {
                            value: finalValue
                        }), resolvedReferences);
                        if (calculated === undefined) {
                            resolvedToken = token;
                        } else {
                            resolvedToken = _object_spread_props(_object_spread({}, token), {
                                value: calculated
                            });
                        }
                    } else {
                        // If it's not, we mark it as failed to resolve
                        var yamlString = (0,js_yaml__WEBPACK_IMPORTED_MODULE_0__.dump)(finalValue);
                        var hasFailingReferences = _constants_AliasRegex__WEBPACK_IMPORTED_MODULE_1__.AliasRegex.test(yamlString);
                        // We combine the values, add the failing reference indicator.
                        // Also, if the originating reference is a string but the resolved value is a composite, we need to add the specific value of the composite token
                        // This is needed for cases like border tokens referencing other border tokens where we want to return the raw value of the border color so we can assign styles or variables.
                        resolvedToken = _object_spread(_object_spread_props(_object_spread({}, token), {
                            value: finalValue,
                            rawValue: token.value
                        }), hasFailingReferences ? {
                            failedToResolve: true
                        } : {}, typeof resolvedValueWithReferences !== "undefined" ? {
                            resolvedValueWithReferences: resolvedValueWithReferences
                        } : {});
                    }
                    // When we have a string, we store the result in cache
                    if (typeof memoKey === "string") {
                        this.memo.set(memoKey, resolvedToken);
                    }
                    // And then return it
                    return resolvedToken;
                }
                // Shadow tokens can be of type array, so we need to resolve those too
                if (Array.isArray(token.value)) {
                    var resolvedArray = [];
                    var failedToResolve = false;
                    var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
                    try {
                        for(var _iterator1 = token.value[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                            var item = _step1.value;
                            // We resolve each individual item, as it might be a reference
                            var resolvedItem = this.resolveReferences({
                                value: item
                            }, resolvedReferences);
                            if (resolvedItem.failedToResolve) {
                                failedToResolve = true;
                            }
                            resolvedArray.push(resolvedItem.value);
                        }
                    } catch (err) {
                        _didIteratorError1 = true;
                        _iteratorError1 = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                                _iterator1.return();
                            }
                        } finally{
                            if (_didIteratorError1) {
                                throw _iteratorError1;
                            }
                        }
                    }
                    // We bring back the resolved array into the token object, and set failedToResolve on the token if needed
                    var resolvedToken1 = _object_spread(_object_spread_props(_object_spread({}, token), {
                        value: resolvedArray,
                        rawValue: token.value
                    }), failedToResolve ? {
                        failedToResolve: failedToResolve
                    } : {});
                    // We save back to cache
                    if (typeof memoKey === "string") {
                        this.memo.set(memoKey, resolvedToken1);
                    }
                    resolvedToken1.resolvedValueWithReferences = token.value;
                    return resolvedToken1;
                }
                // If we have an object (typography, border, shadow, compositions), we need to resolve each property
                if (typeof token.value === "object" && token.value !== null) {
                    var resolvedObject = {};
                    var failedToResolve1 = false;
                    var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
                    try {
                        for(var _iterator2 = Object.keys(token.value)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                            var key = _step2.value;
                            if (Object.prototype.hasOwnProperty.call(token.value, key)) {
                                var propertyTokenValue1 = token.value[key];
                                var resolvedValue = this.resolveReferences({
                                    value: propertyTokenValue1
                                }, resolvedReferences);
                                if (resolvedValue.failedToResolve) {
                                    failedToResolve1 = true;
                                }
                                // Note: This is technically incorrect. We should not be expecting this, but we need to mark those tokens that are referencing an object even though they should be expecting a string as invalid, e only have failedToResolve today. See https://github.com/tokens-studio/figma-plugin/issues/2450
                                if (typeof resolvedValue.value === "object" && key in resolvedValue.value) {
                                    failedToResolve1 = true;
                                }
                                resolvedObject[key] = resolvedValue.value;
                            }
                        }
                    } catch (err) {
                        _didIteratorError2 = true;
                        _iteratorError2 = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                                _iterator2.return();
                            }
                        } finally{
                            if (_didIteratorError2) {
                                throw _iteratorError2;
                            }
                        }
                    }
                    var resolvedToken2 = _object_spread(_object_spread_props(_object_spread({}, token), {
                        value: resolvedObject
                    }), failedToResolve1 ? {
                        failedToResolve: failedToResolve1
                    } : {});
                    // If we have a value, we set it back to cache
                    if (typeof memoKey === "string") {
                        this.memo.set(memoKey, resolvedToken2);
                    }
                    // For all composite tokens we add the resolved value with references to the token.
                    // technically for composites this is not needed, but then we can rely on this one property to contain the original value
                    resolvedToken2.resolvedValueWithReferences = token.value;
                    return resolvedToken2;
                }
                return token;
            }
        },
        {
            key: "get",
            value: function get(tokenName) {
                return this.tokenMap.get(tokenName);
            }
        }
    ]);
    return TokenResolver;
}();
var defaultTokenResolver = new TokenResolver([]);



/***/ }),

/***/ "./src/utils/color/convertToRgb.ts":
/*!*****************************************!*\
  !*** ./src/utils/color/convertToRgb.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertToRgb: () => (/* binding */ convertToRgb)
/* harmony export */ });
/* harmony import */ var color2k__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! color2k */ "../../node_modules/color2k/dist/index.exports.import.es.mjs");
/* harmony import */ var _plugin_figmaTransforms_opacity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/figmaTransforms/opacity */ "./src/plugin/figmaTransforms/opacity.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}


// Convert non-conform colors to RGB value that can be used throughout the plugin
function convertToRgb(color) {
    try {
        if (typeof color !== "string") {
            return color;
        }
        var hexRegex = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/g;
        var hslaRegex = /(hsla?\(.*?\))/g;
        var rgbaRegex = /(rgba?\(.*?\))/g;
        var returnedColor = color;
        try {
            var matchesRgba = Array.from(returnedColor.matchAll(rgbaRegex), function(m) {
                return m[0];
            });
            var matchesHsla = Array.from(returnedColor.matchAll(hslaRegex), function(m) {
                return m[0];
            });
            if (matchesHsla.length > 0) {
                matchesHsla.forEach(function(match) {
                    returnedColor = returnedColor.replace(match, (0,color2k__WEBPACK_IMPORTED_MODULE_1__.toHex)(match));
                });
            }
            if (matchesRgba.length > 0) {
                matchesRgba.forEach(function(match) {
                    var matchedString = match;
                    var matchedColor = match.replace(/rgba?\(/g, "").replace(")", "");
                    var matchesHexInsideRgba = matchedColor.match(hexRegex);
                    var r;
                    var g;
                    var b;
                    var alpha = "1";
                    if (matchesHexInsideRgba) {
                        var _matchedColor_split_pop;
                        var ref;
                        ref = _sliced_to_array((0,color2k__WEBPACK_IMPORTED_MODULE_1__.parseToRgba)(matchesHexInsideRgba[0]), 3), r = ref[0], g = ref[1], b = ref[2], ref;
                        var _matchedColor_split_pop_trim;
                        alpha = (_matchedColor_split_pop_trim = (_matchedColor_split_pop = matchedColor.split(",").pop()) === null || _matchedColor_split_pop === void 0 ? void 0 : _matchedColor_split_pop.trim()) !== null && _matchedColor_split_pop_trim !== void 0 ? _matchedColor_split_pop_trim : "0";
                    } else {
                        var ref1, ref2;
                        ref1 = _sliced_to_array(matchedColor.split(",").map(function(n) {
                            return n.trim();
                        }), 4), r = ref1[0], g = ref1[1], b = ref1[2], ref2 = ref1[3], alpha = ref2 === void 0 ? "1" : ref2, ref1;
                    }
                    var a = (0,_plugin_figmaTransforms_opacity__WEBPACK_IMPORTED_MODULE_0__["default"])(alpha);
                    returnedColor = returnedColor.split(matchedString).join((0,color2k__WEBPACK_IMPORTED_MODULE_1__.toHex)("rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(a, ")")));
                });
            }
        } catch (e) {
            console.log("error", e, color);
        }
        return returnedColor;
    } catch (e) {
        console.error(e);
    }
    return color;
}


/***/ }),

/***/ "./src/utils/color/darken.ts":
/*!***********************************!*\
  !*** ./src/utils/color/darken.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   darken: () => (/* binding */ darken)
/* harmony export */ });
/* harmony import */ var _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/ColorSpaceTypes */ "./src/constants/ColorSpaceTypes.ts");

function darken(color, colorSpace, amount) {
    switch(colorSpace){
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.LCH:
            {
                var lightness = color.lch.l;
                var difference = lightness;
                var newChroma = Math.max(0, color.lch.c - amount * color.lch.c);
                var newLightness = Math.max(0, lightness - difference * amount);
                color.set("lch.l", newLightness);
                color.set("lch.c", newChroma);
                return color;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.HSL:
            {
                var lightness1 = color.hsl.l;
                var difference1 = lightness1;
                var newLightness1 = Math.max(0, lightness1 - difference1 * amount);
                color.set("hsl.l", newLightness1);
                return color;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.P3:
            {
                var colorInP3 = color.to("p3");
                var newRed = Math.max(0, colorInP3.p3.r - amount * colorInP3.p3.r);
                var newGreen = Math.max(0, colorInP3.p3.g - amount * colorInP3.p3.g);
                var newBlue = Math.max(0, colorInP3.p3.b - amount * colorInP3.p3.b);
                colorInP3.set("p3.r", newRed);
                colorInP3.set("p3.g", newGreen);
                colorInP3.set("p3.b", newBlue);
                return colorInP3;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.SRGB:
            {
                var newRed1 = Math.max(0, color.srgb.r - amount * color.srgb.r);
                var newGreen1 = Math.max(0, color.srgb.g - amount * color.srgb.g);
                var newBlue1 = Math.max(0, color.srgb.b - amount * color.srgb.b);
                color.set("srgb.r", newRed1);
                color.set("srgb.g", newGreen1);
                color.set("srgb.b", newBlue1);
                return color;
            }
        default:
            {
                return color.darken(amount);
            }
    }
}


/***/ }),

/***/ "./src/utils/color/getColorSwatchStyle.ts":
/*!************************************************!*\
  !*** ./src/utils/color/getColorSwatchStyle.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getColorSwatchStyle: () => (/* binding */ getColorSwatchStyle)
/* harmony export */ });
function getColorSwatchStyle(tokenValue) {
    return tokenValue.includes(";") ? {
        background: tokenValue.replace(/;/g, "")
    } : {
        background: tokenValue
    };
}


/***/ }),

/***/ "./src/utils/color/getReferenceTokensFromGradient.ts":
/*!***********************************************************!*\
  !*** ./src/utils/color/getReferenceTokensFromGradient.ts ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getReferenceTokensFromGradient: () => (/* binding */ getReferenceTokensFromGradient)
/* harmony export */ });
var getReferenceTokensFromGradient = function(rawValue) {
    var rawValueDetails = rawValue.replace("linear-gradient(", "").replace(")", "").split(",");
    var referenceTokens = rawValueDetails.reduce(function(acc, curr) {
        // Check is the current part contains color value or reference token
        if (curr.includes("#") || curr.includes("{")) {
            var matches = curr.match(/{(.*?)}/g);
            // Return empty string in case of not reference token
            acc.push(matches ? matches[0].replace(/[{}]/g, "") : "");
        }
        return acc;
    }, []);
    return referenceTokens;
};


/***/ }),

/***/ "./src/utils/color/index.ts":
/*!**********************************!*\
  !*** ./src/utils/color/index.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertToRgb: () => (/* reexport safe */ _convertToRgb__WEBPACK_IMPORTED_MODULE_0__.convertToRgb),
/* harmony export */   getColorSwatchStyle: () => (/* reexport safe */ _getColorSwatchStyle__WEBPACK_IMPORTED_MODULE_3__.getColorSwatchStyle),
/* harmony export */   getReferenceTokensFromGradient: () => (/* reexport safe */ _getReferenceTokensFromGradient__WEBPACK_IMPORTED_MODULE_2__.getReferenceTokensFromGradient),
/* harmony export */   lightOrDark: () => (/* reexport safe */ _isLightOrDark__WEBPACK_IMPORTED_MODULE_1__.lightOrDark)
/* harmony export */ });
/* harmony import */ var _convertToRgb__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./convertToRgb */ "./src/utils/color/convertToRgb.ts");
/* harmony import */ var _isLightOrDark__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isLightOrDark */ "./src/utils/color/isLightOrDark.ts");
/* harmony import */ var _getReferenceTokensFromGradient__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getReferenceTokensFromGradient */ "./src/utils/color/getReferenceTokensFromGradient.ts");
/* harmony import */ var _getColorSwatchStyle__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./getColorSwatchStyle */ "./src/utils/color/getColorSwatchStyle.ts");






/***/ }),

/***/ "./src/utils/color/isLightOrDark.ts":
/*!******************************************!*\
  !*** ./src/utils/color/isLightOrDark.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lightOrDark: () => (/* binding */ lightOrDark)
/* harmony export */ });
/* harmony import */ var color2k__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! color2k */ "../../node_modules/color2k/dist/index.exports.import.es.mjs");

// Light or dark check for Token Buttons: If color is very bright e.g. white we show a different style
function lightOrDark(color) {
    if (typeof color !== "string") {
        return "light";
    }
    try {
        return (0,color2k__WEBPACK_IMPORTED_MODULE_0__.readableColorIsBlack)(color) ? "light" : "dark";
    } catch (e) {
        return "light";
    }
}


/***/ }),

/***/ "./src/utils/color/lighten.ts":
/*!************************************!*\
  !*** ./src/utils/color/lighten.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   lighten: () => (/* binding */ lighten)
/* harmony export */ });
/* harmony import */ var _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/ColorSpaceTypes */ "./src/constants/ColorSpaceTypes.ts");

function lighten(color, colorSpace, amount) {
    switch(colorSpace){
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.LCH:
            {
                var lightness = color.lch.l;
                var difference = 100 - lightness;
                var newChroma = Math.max(0, color.lch.c - amount * color.lch.c);
                var newLightness = Math.min(100, lightness + difference * amount);
                color.set("lch.l", newLightness);
                color.set("lch.c", newChroma);
                return color;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.HSL:
            {
                var lightness1 = color.hsl.l;
                var difference1 = 100 - lightness1;
                var newLightness1 = Math.min(100, lightness1 + difference1 * amount);
                color.set("hsl.l", newLightness1);
                return color;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.P3:
            {
                var colorInP3 = color.to("p3");
                var newRed = Math.min(1, colorInP3.p3.r + amount * (1 - colorInP3.p3.r));
                var newGreen = Math.min(1, colorInP3.p3.g + amount * (1 - colorInP3.p3.g));
                var newBlue = Math.min(1, colorInP3.p3.b + amount * (1 - colorInP3.p3.b));
                colorInP3.set("p3.r", newRed);
                colorInP3.set("p3.g", newGreen);
                colorInP3.set("p3.b", newBlue);
                return colorInP3;
            }
        case _constants_ColorSpaceTypes__WEBPACK_IMPORTED_MODULE_0__.ColorSpaceTypes.SRGB:
            {
                var newRed1 = Math.min(1, color.srgb.r + amount * (1 - color.srgb.r));
                var newGreen1 = Math.min(1, color.srgb.g + amount * (1 - color.srgb.g));
                var newBlue1 = Math.min(1, color.srgb.b + amount * (1 - color.srgb.b));
                color.set("srgb.r", newRed1);
                color.set("srgb.g", newGreen1);
                color.set("srgb.b", newBlue1);
                return color;
            }
        default:
            {
                return color.lighten(amount);
            }
    }
}


/***/ }),

/***/ "./src/utils/color/mix.ts":
/*!********************************!*\
  !*** ./src/utils/color/mix.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mix: () => (/* binding */ mix)
/* harmony export */ });
/* harmony import */ var colorjs_io__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! colorjs.io */ "../../node_modules/colorjs.io/dist/color.js");

function mix(color, colorSpace, amount, mixColor) {
    var mixValue = Math.max(0, Math.min(1, Number(amount)));
    return new colorjs_io__WEBPACK_IMPORTED_MODULE_0__["default"](color.mix(mixColor, mixValue, {
        space: colorSpace
    }).toString());
}


/***/ }),

/***/ "./src/utils/color/transparentize.ts":
/*!*******************************************!*\
  !*** ./src/utils/color/transparentize.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   transparentize: () => (/* binding */ transparentize)
/* harmony export */ });
function transparentize(color, amount) {
    color.alpha = Math.max(0, Math.min(1, Number(amount)));
    return color;
}


/***/ }),

/***/ "./src/utils/convertModifiedColorToHex.ts":
/*!************************************************!*\
  !*** ./src/utils/convertModifiedColorToHex.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertModifiedColorToHex: () => (/* binding */ convertModifiedColorToHex)
/* harmony export */ });
/* harmony import */ var colorjs_io__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! colorjs.io */ "../../node_modules/colorjs.io/dist/color.js");
/* harmony import */ var _modifyColor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modifyColor */ "./src/utils/modifyColor.ts");


function convertModifiedColorToHex(baseColor, modifier) {
    var returnedColor = baseColor;
    try {
        returnedColor = (0,_modifyColor__WEBPACK_IMPORTED_MODULE_0__.modifyColor)(baseColor, modifier);
        var returnedColorInSpace = new colorjs_io__WEBPACK_IMPORTED_MODULE_1__["default"](returnedColor);
        return returnedColorInSpace.to("srgb").toString({
            format: "hex"
        });
    } catch (e) {
        return baseColor;
    }
}


/***/ }),

/***/ "./src/utils/convertToDefaultProperty.ts":
/*!***********************************************!*\
  !*** ./src/utils/convertToDefaultProperty.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   convertToDefaultProperty: () => (/* binding */ convertToDefaultProperty)
/* harmony export */ });
/* harmony import */ var _constants_Properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/Properties */ "./src/constants/Properties.ts");

function convertToDefaultProperty(property) {
    var type = "";
    switch(property){
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.width:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.height:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.sizing:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.itemSpacing:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.verticalPadding:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.horizontalPadding:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.paddingTop:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.paddingLeft:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.paddingBottom:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.paddingRight:
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.dimension;
            break;
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderRadiusTopLeft:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderRadiusTopRight:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderRadiusBottomLeft:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderRadiusBottomRight:
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderRadius;
            break;
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderColor:
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.fill;
            break;
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderWidthTop:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderWidthLeft:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderWidthRight:
        case _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderWidthBottom:
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.borderWidth;
            break;
        case "fontFamily":
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.fontFamilies;
            break;
        case "fontSize":
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.fontSizes;
            break;
        case "fontWeight":
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.fontWeights;
            break;
        case "lineHeights":
        case "lineHeight":
            type = _constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties.lineHeights;
            break;
        case "style":
            type = "strokeStyle";
            break;
        default:
            type = property;
            break;
    }
    return type;
}


/***/ }),

/***/ "./src/utils/convertTokens.tsx":
/*!*************************************!*\
  !*** ./src/utils/convertTokens.tsx ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ convertToTokenArray)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
/* harmony import */ var _is__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./is */ "./src/utils/is/index.ts");
/* harmony import */ var _is_isTokenGroupWithType__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./is/isTokenGroupWithType */ "./src/utils/is/isTokenGroupWithType.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
/* harmony import */ var _is_isSingleTokenInJson__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./is/isSingleTokenInJson */ "./src/utils/is/isSingleTokenInJson.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_primitive(input, hint) {
    if (_type_of(input) !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
        var res = prim.call(input, hint || "default");
        if (_type_of(res) !== "object") return res;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
}
function _to_property_key(arg) {
    var key = _to_primitive(arg, "string");
    return _type_of(key) === "symbol" ? key : String(key);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}





// @TODO fix typings
function checkForTokens(param) {
    var obj = param.obj, token = param.token, _param_root = param.root, root = _param_root === void 0 ? null : _param_root, _param_returnValuesOnly = param.returnValuesOnly, returnValuesOnly = _param_returnValuesOnly === void 0 ? false : _param_returnValuesOnly, _param_expandTypography = param.expandTypography, expandTypography = _param_expandTypography === void 0 ? false : _param_expandTypography, _param_expandShadow = param.expandShadow, expandShadow = _param_expandShadow === void 0 ? false : _param_expandShadow, _param_expandComposition = param.expandComposition, expandComposition = _param_expandComposition === void 0 ? false : _param_expandComposition, _param_expandBorder = param.expandBorder, expandBorder = _param_expandBorder === void 0 ? false : _param_expandBorder, inheritType = param.inheritType, _param_groupLevel = param.groupLevel, groupLevel = _param_groupLevel === void 0 ? 0 : _param_groupLevel, _param_currentTypeLevel = param.currentTypeLevel, currentTypeLevel = _param_currentTypeLevel === void 0 ? 0 : _param_currentTypeLevel;
    var returnValue;
    if ((0,_is_isSingleTokenInJson__WEBPACK_IMPORTED_MODULE_4__.isSingleTokenInJSON)(token)) {
        returnValue = token;
        returnValue.value = token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenValueKey];
        if (token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey] && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey] === "string") {
            returnValue.description = token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey];
        }
        if (!token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey] && inheritType) {
            returnValue.type = inheritType;
            returnValue.inheritTypeLevel = currentTypeLevel;
        } else {
            returnValue.type = token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey];
            if (inheritType === token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey] && currentTypeLevel > 0) {
                returnValue.inheritTypeLevel = currentTypeLevel;
            }
        }
    } else if ((0,_is__WEBPACK_IMPORTED_MODULE_1__.isSingleTypographyToken)(token) || (0,_is__WEBPACK_IMPORTED_MODULE_1__.isSingleBoxShadowToken)(token) || (0,_is__WEBPACK_IMPORTED_MODULE_1__.isSingleCompositionToken)(token) || (0,_is__WEBPACK_IMPORTED_MODULE_1__.isSingleBorderToken)(token)) {
        returnValue = token;
        returnValue.value = Object.entries(token).reduce(function(acc, param) {
            var _param = _sliced_to_array(param, 2), key = _param[0], val = _param[1];
            acc[key] = (0,_is__WEBPACK_IMPORTED_MODULE_1__.isSingleTokenValueObject)(val) && returnValuesOnly ? val[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenValueKey] : val;
            return acc;
        }, {});
        if (token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey] && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey] === "string") {
            returnValue.description = token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenDescriptionKey];
        }
        if (!token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey] && inheritType) {
            returnValue.type = inheritType;
            returnValue.inheritTypeLevel = currentTypeLevel;
        } else {
            returnValue.type = token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey];
        }
    } else if (typeof token === "object") {
        // We dont have a single token value key yet, so it's likely a group which we need to iterate over
        // This would be where we push a `group` entity to the array, once we do want to tackle group descriptions or group metadata
        var tokenToCheck = token;
        groupLevel += 1;
        // When token groups are typed, we need to inherit the type to their children
        if ((0,_is_isTokenGroupWithType__WEBPACK_IMPORTED_MODULE_2__.isTokenGroupWithType)(token)) {
            var _TokenFormat_tokenTypeKey = _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_3__.TokenFormat.tokenTypeKey, groupType = token[_TokenFormat_tokenTypeKey], tokenValues = _object_without_properties(token, [
                _TokenFormat_tokenTypeKey
            ].map(_to_property_key));
            inheritType = groupType;
            currentTypeLevel = groupLevel;
            tokenToCheck = tokenValues;
        }
        if (typeof tokenToCheck !== "undefined" || tokenToCheck !== null) {
            Object.entries(tokenToCheck).forEach(function(param) {
                var _param = _sliced_to_array(param, 2), key = _param[0], value = _param[1];
                var _checkForTokens = _sliced_to_array(checkForTokens({
                    obj: obj,
                    token: value,
                    root: [
                        root,
                        key
                    ].filter(function(n) {
                        return n;
                    }).join("."),
                    returnValuesOnly: returnValuesOnly,
                    expandTypography: expandTypography,
                    expandShadow: expandShadow,
                    expandComposition: expandComposition,
                    expandBorder: expandBorder,
                    inheritType: inheritType,
                    groupLevel: groupLevel,
                    currentTypeLevel: currentTypeLevel
                }), 2), result = _checkForTokens[1];
                if (root && result) {
                    obj.push(_object_spread_props(_object_spread({}, result), {
                        name: [
                            root,
                            key
                        ].join(".")
                    }));
                } else if (result) {
                    obj.push(_object_spread_props(_object_spread({}, result), {
                        name: key
                    }));
                }
            });
        }
    } else {
        // If all else fails, we just return the token as the value, and type as other
        returnValue = {
            value: token,
            type: _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.OTHER
        };
    }
    if (typeof returnValue === "object" && "name" in returnValue && (returnValue === null || returnValue === void 0 ? void 0 : returnValue.name)) {
        returnValue.name = returnValue.name.split("/").join(".");
    }
    return [
        obj,
        returnValue
    ];
}
function convertToTokenArray(param) {
    var tokens = param.tokens;
    var _checkForTokens = _sliced_to_array(checkForTokens({
        obj: [],
        root: null,
        token: tokens
    }), 1), result = _checkForTokens[0];
    // Internally we dont care about $value or value, we always use value, so remove it
    return Object.values(result).map(function(token) {
        if ("$value" in token) delete token.$value;
        if ("$description" in token) delete token.$description;
        if ("$type" in token) delete token.$type;
        return token;
    });
}


/***/ }),

/***/ "./src/utils/convertTokensObjectToResolved.ts":
/*!****************************************************!*\
  !*** ./src/utils/convertTokensObjectToResolved.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ convertTokensObjectToResolved)
/* harmony export */ });
/* harmony import */ var _utils_tokenHelpers__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/utils/tokenHelpers */ "./src/utils/tokenHelpers.ts");
/* harmony import */ var _convertTokensToGroupedObject__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./convertTokensToGroupedObject */ "./src/utils/convertTokensToGroupedObject.ts");
/* harmony import */ var _parseTokenValues__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./parseTokenValues */ "./src/utils/parseTokenValues.ts");
/* harmony import */ var _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/constants/TokenSetStatus */ "./src/constants/TokenSetStatus.ts");
/* harmony import */ var _TokenResolver__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./TokenResolver */ "./src/utils/TokenResolver.ts");





// Takes Figma Tokens input, resolves all aliases while respecting user's theme choice and outputs an object with resolved tokens, ready to be consumed by style dictionary.
function convertTokensObjectToResolved(tokens) {
    var usedSets = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [], excludedSets = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [], options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {
        expandTypography: false,
        expandShadow: false,
        expandComposition: false,
        expandBorder: false,
        preserveRawValue: false,
        resolveReferences: true
    };
    // Parse tokens into array structure
    var parsed = (0,_parseTokenValues__WEBPACK_IMPORTED_MODULE_2__["default"])(tokens);
    // Merge to one giant array
    var merged = (0,_utils_tokenHelpers__WEBPACK_IMPORTED_MODULE_0__.mergeTokenGroups)(parsed, // @README this function is only used in the utils/transform file
    // which in turn is only used for a local script -- in which case for now we do not
    // need to fully support the SOURCE state
    Object.fromEntries(usedSets.map(function(tokenSet) {
        return [
            tokenSet,
            _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_3__.TokenSetStatus.ENABLED
        ];
    })));
    // Resolve aliases
    var resolved = _TokenResolver__WEBPACK_IMPORTED_MODULE_4__.defaultTokenResolver.setTokens(merged);
    // Group back into one object
    var object = (0,_convertTokensToGroupedObject__WEBPACK_IMPORTED_MODULE_1__["default"])(resolved, excludedSets, options);
    return object;
}


/***/ }),

/***/ "./src/utils/convertTokensToGroupedObject.ts":
/*!***************************************************!*\
  !*** ./src/utils/convertTokensToGroupedObject.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ convertTokensToGroupedObject)
/* harmony export */ });
/* harmony import */ var set_value__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! set-value */ "./node_modules/set-value/index.js");
/* harmony import */ var set_value__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(set_value__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _app_components_createTokenObj__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/app/components/createTokenObj */ "./src/app/components/createTokenObj.tsx");
/* harmony import */ var _utils_expand__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/expand */ "./src/utils/expand.ts");
/* harmony import */ var _utils_getValueWithReferences__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @/utils/getValueWithReferences */ "./src/utils/getValueWithReferences.ts");
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}





// @TODO fix tokenObj
function convertTokensToGroupedObject(tokens, excludedSets, options) {
    var tokenObj = {};
    tokenObj = tokens.reduce(function(acc, token) {
        if (options.throwErrorWhenNotResolved && token.failedToResolve) {
            throw new Error('ERROR: failed to resolve token "'.concat(token.name, '"'));
        }
        if (token.internal__Parent && excludedSets.includes(token.internal__Parent)) {
            return acc;
        }
        var obj = acc || {};
        var tokenWithType = (0,_app_components_createTokenObj__WEBPACK_IMPORTED_MODULE_1__.appendTypeToToken)(token);
        delete tokenWithType.name;
        if (options.resolveReferences !== true) {
            tokenWithType.value = (0,_utils_getValueWithReferences__WEBPACK_IMPORTED_MODULE_3__.getValueWithReferences)(tokenWithType, options);
        } else {
            delete tokenWithType.$extensions;
        }
        if (!options.preserveRawValue) {
            delete tokenWithType.rawValue;
        }
        delete tokenWithType.internal__Parent;
        delete tokenWithType.resolvedValueWithReferences;
        if (!!options.expandTypography && tokenWithType.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_4__.TokenTypes.TYPOGRAPHY || !!options.expandShadow && tokenWithType.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_4__.TokenTypes.BOX_SHADOW || !!options.expandComposition && tokenWithType.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_4__.TokenTypes.COMPOSITION || !!options.expandBorder && tokenWithType.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_4__.TokenTypes.BORDER) {
            var expanded = (0,_utils_expand__WEBPACK_IMPORTED_MODULE_2__.expand)(tokenWithType.value);
            set_value__WEBPACK_IMPORTED_MODULE_0___default()(obj, token.name, _object_spread({}, expanded));
        } else {
            set_value__WEBPACK_IMPORTED_MODULE_0___default()(obj, token.name, tokenWithType);
        }
        return acc;
    }, {});
    return tokenObj;
}


/***/ }),

/***/ "./src/utils/detectFormat.tsx":
/*!************************************!*\
  !*** ./src/utils/detectFormat.tsx ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   detectFormat: () => (/* binding */ detectFormat)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function detectFormat(tokens, shouldSet) {
    var stringifiedTokens = JSON.stringify(tokens);
    if (stringifiedTokens.includes("$value")) {
        if (shouldSet) _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.setFormat(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormatOptions.DTCG);
        return _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormatOptions.DTCG;
    }
    if (shouldSet) _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.setFormat(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormatOptions.Legacy);
    return _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormatOptions.Legacy;
}


/***/ }),

/***/ "./src/utils/expand.ts":
/*!*****************************!*\
  !*** ./src/utils/expand.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   expand: () => (/* binding */ expand)
/* harmony export */ });
/* harmony import */ var _convertToDefaultProperty__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./convertToDefaultProperty */ "./src/utils/convertToDefaultProperty.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}


function expand(token) {
    return Object.entries(token).reduce(function(acc, param) {
        var _param = _sliced_to_array(param, 2), key = _param[0], val = _param[1];
        if (typeof val === "string" || typeof val === "number") {
            // Temporarily cast to 'any' to bypass TypeScript's static type checking. Our keys can either be value or $value (same for type)
            var resultItem = {};
            resultItem[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] = val;
            resultItem[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenTypeKey] = (0,_convertToDefaultProperty__WEBPACK_IMPORTED_MODULE_0__.convertToDefaultProperty)(key);
            // Now cast back to BaseResult
            acc[key] = resultItem;
        } else {
            acc[key] = expand(val);
        }
        return acc;
    }, {});
}


/***/ }),

/***/ "./src/utils/getPathName.ts":
/*!**********************************!*\
  !*** ./src/utils/getPathName.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getPathName: () => (/* binding */ getPathName)
/* harmony export */ });
function getPathName(ref) {
    if (ref.startsWith("{")) {
        return ref.slice(1, ref.length - 1);
    }
    return ref.substring(1);
}


/***/ }),

/***/ "./src/utils/getTokenSetsOrder.ts":
/*!****************************************!*\
  !*** ./src/utils/getTokenSetsOrder.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTokenSetsOrder: () => (/* binding */ getTokenSetsOrder)
/* harmony export */ });
/* harmony import */ var _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenSetStatus */ "./src/constants/TokenSetStatus.ts");
/* harmony import */ var _sortSets__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sortSets */ "./src/utils/sortSets.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}


function getTokenSetsOrder(tokens, usedSets, overallConfig, activeTokenSet) {
    var originalTokenSetOrder = Object.keys(tokens);
    var usedSetsList = originalTokenSetOrder.filter(function(key) {
        return usedSets[key] === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.ENABLED || usedSets[key] === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.SOURCE;
    });
    var overallSets = originalTokenSetOrder.filter(function(set) {
        return !usedSetsList.includes(set);
    }).sort(function(a, b) {
        return (0,_sortSets__WEBPACK_IMPORTED_MODULE_1__.sortSets)(a, b, overallConfig);
    });
    if (activeTokenSet) {
        usedSetsList.splice(usedSetsList.indexOf(activeTokenSet), 1);
        usedSetsList.push(activeTokenSet);
    }
    var tokenSetsOrder = _to_consumable_array(overallSets).concat(_to_consumable_array(usedSetsList));
    return {
        tokenSetsOrder: tokenSetsOrder,
        usedSetsList: usedSetsList,
        overallSets: overallSets
    };
}


/***/ }),

/***/ "./src/utils/getTokenTypeKey.ts":
/*!**************************************!*\
  !*** ./src/utils/getTokenTypeKey.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTokenTypeKey: () => (/* binding */ getTokenTypeKey)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function getTokenTypeKey() {
    var ignoreTokenFormat = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    var key = _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenTypeKey;
    return ignoreTokenFormat && key.startsWith("$") ? key.slice(1) : key;
}


/***/ }),

/***/ "./src/utils/getTokenValueKey.ts":
/*!***************************************!*\
  !*** ./src/utils/getTokenValueKey.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTokenValueKey: () => (/* binding */ getTokenValueKey)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function getTokenValueKey() {
    var ignoreTokenFormat = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
    var key = _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey;
    return ignoreTokenFormat && key.startsWith("$") ? key.slice(1) : key;
}


/***/ }),

/***/ "./src/utils/getValueWithReferences.ts":
/*!*********************************************!*\
  !*** ./src/utils/getValueWithReferences.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getValueWithReferences: () => (/* binding */ getValueWithReferences)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}

function getSimpleValue(resolvedValue, rawValue, options) {
    var value = resolvedValue;
    /*
   * ***************************************************************************
   * TOKEN EXAMPLES WHEN USING --resolveReferences='math'
   * ***************************************************************************
   * {spacing.xs} * 2                 =>  MATH EXPRESSION       => RESOLVE
   * {spacing.xs} * {spacing.scale}   =>  MATH EXPRESSION       => RESOLVE
   *
   * {spacing.xs}                     =>  SINGLE TOKEN          => DON'T RESOLVE
   * {spacing.xs}rem                  =>  SINGLE TOKEN + UNIT   => DON'T RESOLVE
   * {spacing.xs}{spacing.unit}       =>  MULTIPLE TOKENS       => DON'T RESOLVE
   *
   * rgba(255, 0, 0, {opacity.low})   =>  CSS FUNCTION          => DON'T RESOLVE
   * calc({spacing.xl} * 2)           =>  CSS FUNCTION          => DON'T RESOLVE
   * 20% {border-radius.smooth}       =>  CSS LIST VALUE        => DON'T RESOLVE
   * ***************************************************************************
   */ if (typeof rawValue === "string" && resolvedValue.toString() !== rawValue) {
        if (options.resolveReferences === false) {
            value = rawValue;
        }
        if (options.resolveReferences === "math") {
            var singleAliasRegEx = /^{[^}]*}$|^\$[^$]*$/;
            var oneOrMoreAliasRegEx = /{[^}]*}|\$[\w.-]*/g;
            var aliasRegEx = typeof resolvedValue === "number" ? singleAliasRegEx : oneOrMoreAliasRegEx;
            if (aliasRegEx.test(rawValue)) {
                value = rawValue;
            }
        }
    }
    return value; // TODO: remove `as string` when SingleGenericToken supports value as `string|number`
}
function getComplexValue(resolvedValue, rawValue, options) {
    if (typeof resolvedValue === "object") {
        return Object.entries(resolvedValue).reduce(function(acc, param) {
            var _param = _sliced_to_array(param, 2), key = _param[0], val = _param[1];
            var rawVal = rawValue[key];
            // TODO: Remove as SingleToken["value"]
            acc[key] = getSimpleValue(val, rawVal, options);
            return acc;
        }, {});
    }
    return getSimpleValue(resolvedValue, rawValue, options);
}
function getValueWithReferences(token, options) {
    if (token.rawValue === undefined) {
        return token.value;
    }
    if (token.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.TYPOGRAPHY || token.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BOX_SHADOW || token.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.COMPOSITION || token.type === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BORDER) {
        if (Array.isArray(token.value)) {
            var rawValue = token.rawValue;
            return token.value.map(function(shadow, index) {
                return getComplexValue(shadow, rawValue[index], options);
            });
        }
        return getComplexValue(token.value, token.rawValue, options);
    }
    return getSimpleValue(token.value, token.rawValue, options);
}


/***/ }),

/***/ "./src/utils/is/index.ts":
/*!*******************************!*\
  !*** ./src/utils/is/index.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isGitProvider: () => (/* reexport safe */ _isGitProvider__WEBPACK_IMPORTED_MODULE_7__.isGitProvider),
/* harmony export */   isMatchingStyle: () => (/* reexport safe */ _isMatchingStyle__WEBPACK_IMPORTED_MODULE_11__.isMatchingStyle),
/* harmony export */   isPrimitiveValue: () => (/* reexport safe */ _isPrimitiveValue__WEBPACK_IMPORTED_MODULE_8__.isPrimitiveValue),
/* harmony export */   isPropertyType: () => (/* reexport safe */ _isPropertyType__WEBPACK_IMPORTED_MODULE_4__.isPropertyType),
/* harmony export */   isSingleBorderToken: () => (/* reexport safe */ _isSingleBorderToken__WEBPACK_IMPORTED_MODULE_12__.isSingleBorderToken),
/* harmony export */   isSingleBorderTokenInJSON: () => (/* reexport safe */ _isSingleBorderToken__WEBPACK_IMPORTED_MODULE_12__.isSingleBorderTokenInJSON),
/* harmony export */   isSingleBoxShadowToken: () => (/* reexport safe */ _isSingleBoxShadowToken__WEBPACK_IMPORTED_MODULE_5__.isSingleBoxShadowToken),
/* harmony export */   isSingleBoxShadowTokenInJSON: () => (/* reexport safe */ _isSingleBoxShadowToken__WEBPACK_IMPORTED_MODULE_5__.isSingleBoxShadowTokenInJSON),
/* harmony export */   isSingleBoxShadowValue: () => (/* reexport safe */ _isSingleBoxShadowValue__WEBPACK_IMPORTED_MODULE_9__.isSingleBoxShadowValue),
/* harmony export */   isSingleCompositionToken: () => (/* reexport safe */ _isSingleCompositionToken__WEBPACK_IMPORTED_MODULE_2__.isSingleCompositionToken),
/* harmony export */   isSingleCompositionTokenInJSON: () => (/* reexport safe */ _isSingleCompositionToken__WEBPACK_IMPORTED_MODULE_2__.isSingleCompositionTokenInJSON),
/* harmony export */   isSingleToken: () => (/* reexport safe */ _isSingleToken__WEBPACK_IMPORTED_MODULE_3__.isSingleToken),
/* harmony export */   isSingleTokenValueObject: () => (/* reexport safe */ _isSingleTokenValueObject__WEBPACK_IMPORTED_MODULE_0__.isSingleTokenValueObject),
/* harmony export */   isSingleTypographyToken: () => (/* reexport safe */ _isSingleTypographyToken__WEBPACK_IMPORTED_MODULE_1__.isSingleTypographyToken),
/* harmony export */   isSingleTypographyTokenInJSON: () => (/* reexport safe */ _isSingleTypographyToken__WEBPACK_IMPORTED_MODULE_1__.isSingleTypographyTokenInJSON),
/* harmony export */   isSingleTypographyValue: () => (/* reexport safe */ _isSingleTypographyValue__WEBPACK_IMPORTED_MODULE_10__.isSingleTypographyValue),
/* harmony export */   isTokenType: () => (/* reexport safe */ _isTokenType__WEBPACK_IMPORTED_MODULE_6__.isTokenType)
/* harmony export */ });
/* harmony import */ var _isSingleTokenValueObject__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./isSingleTokenValueObject */ "./src/utils/is/isSingleTokenValueObject.ts");
/* harmony import */ var _isSingleTypographyToken__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./isSingleTypographyToken */ "./src/utils/is/isSingleTypographyToken.ts");
/* harmony import */ var _isSingleCompositionToken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./isSingleCompositionToken */ "./src/utils/is/isSingleCompositionToken.ts");
/* harmony import */ var _isSingleToken__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./isSingleToken */ "./src/utils/is/isSingleToken.ts");
/* harmony import */ var _isPropertyType__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./isPropertyType */ "./src/utils/is/isPropertyType.ts");
/* harmony import */ var _isSingleBoxShadowToken__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./isSingleBoxShadowToken */ "./src/utils/is/isSingleBoxShadowToken.ts");
/* harmony import */ var _isTokenType__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./isTokenType */ "./src/utils/is/isTokenType.ts");
/* harmony import */ var _isGitProvider__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./isGitProvider */ "./src/utils/is/isGitProvider.ts");
/* harmony import */ var _isPrimitiveValue__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./isPrimitiveValue */ "./src/utils/is/isPrimitiveValue.ts");
/* harmony import */ var _isSingleBoxShadowValue__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./isSingleBoxShadowValue */ "./src/utils/is/isSingleBoxShadowValue.ts");
/* harmony import */ var _isSingleTypographyValue__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./isSingleTypographyValue */ "./src/utils/is/isSingleTypographyValue.ts");
/* harmony import */ var _isMatchingStyle__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./isMatchingStyle */ "./src/utils/is/isMatchingStyle.ts");
/* harmony import */ var _isSingleBorderToken__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./isSingleBorderToken */ "./src/utils/is/isSingleBorderToken.ts");















/***/ }),

/***/ "./src/utils/is/isGitProvider.ts":
/*!***************************************!*\
  !*** ./src/utils/is/isGitProvider.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isGitProvider: () => (/* binding */ isGitProvider)
/* harmony export */ });
/* harmony import */ var _constants_StorageProviderType__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/StorageProviderType */ "./src/constants/StorageProviderType.ts");

function isGitProvider(provider) {
    return provider.provider === _constants_StorageProviderType__WEBPACK_IMPORTED_MODULE_0__.StorageProviderType.ADO || provider.provider === _constants_StorageProviderType__WEBPACK_IMPORTED_MODULE_0__.StorageProviderType.GITHUB || provider.provider === _constants_StorageProviderType__WEBPACK_IMPORTED_MODULE_0__.StorageProviderType.GITLAB || provider.provider === _constants_StorageProviderType__WEBPACK_IMPORTED_MODULE_0__.StorageProviderType.BITBUCKET;
}


/***/ }),

/***/ "./src/utils/is/isMatchingStyle.ts":
/*!*****************************************!*\
  !*** ./src/utils/is/isMatchingStyle.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isMatchingStyle: () => (/* binding */ isMatchingStyle)
/* harmony export */ });
function isMatchingStyle(tokenPath, style) {
    var splitName = style.name.split("/").map(function(name) {
        return name.trim();
    });
    var trimmedName = splitName.join("/");
    return trimmedName === tokenPath;
}


/***/ }),

/***/ "./src/utils/is/isPrimitiveValue.ts":
/*!******************************************!*\
  !*** ./src/utils/is/isPrimitiveValue.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isPrimitiveValue: () => (/* binding */ isPrimitiveValue)
/* harmony export */ });
function isPrimitiveValue(value) {
    return typeof value === "string" || typeof value === "boolean" || typeof value === "number";
}


/***/ }),

/***/ "./src/utils/is/isPropertyType.ts":
/*!****************************************!*\
  !*** ./src/utils/is/isPropertyType.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isPropertyType: () => (/* binding */ isPropertyType)
/* harmony export */ });
/* harmony import */ var _constants_Properties__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/Properties */ "./src/constants/Properties.ts");

function isPropertyType(input) {
    return Object.values(_constants_Properties__WEBPACK_IMPORTED_MODULE_0__.Properties).includes(input);
}


/***/ }),

/***/ "./src/utils/is/isSingleBorderToken.ts":
/*!*********************************************!*\
  !*** ./src/utils/is/isSingleBorderToken.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleBorderToken: () => (/* binding */ isSingleBorderToken),
/* harmony export */   isSingleBorderTokenInJSON: () => (/* binding */ isSingleBorderTokenInJSON)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
/* harmony import */ var _getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../getTokenTypeKey */ "./src/utils/getTokenTypeKey.ts");
/* harmony import */ var _getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../getTokenValueKey */ "./src/utils/getTokenValueKey.ts");




function isSingleBorderToken(token) {
    var ignoreTokenFormat = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    if (typeof token !== "object") return false;
    var tokenTypeKey = (0,_getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__.getTokenTypeKey)(ignoreTokenFormat);
    var tokenValueKey = (0,_getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__.getTokenValueKey)(ignoreTokenFormat);
    return token[tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BORDER && (typeof token[tokenValueKey] === "string" || typeof token[tokenValueKey] === "object" && !(tokenValueKey in token[tokenValueKey]));
}
function isSingleBorderTokenInJSON(token) {
    if (typeof token !== "object") return false;
    return token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BORDER && (typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "string" || typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "object" && !(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleBoxShadowToken.ts":
/*!************************************************!*\
  !*** ./src/utils/is/isSingleBoxShadowToken.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleBoxShadowToken: () => (/* binding */ isSingleBoxShadowToken),
/* harmony export */   isSingleBoxShadowTokenInJSON: () => (/* binding */ isSingleBoxShadowTokenInJSON)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
/* harmony import */ var _getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../getTokenTypeKey */ "./src/utils/getTokenTypeKey.ts");
/* harmony import */ var _getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../getTokenValueKey */ "./src/utils/getTokenValueKey.ts");




function isSingleBoxShadowToken(token) {
    var ignoreTokenFormat = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    if (typeof token !== "object") return false;
    var tokenTypeKey = (0,_getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__.getTokenTypeKey)(ignoreTokenFormat);
    var tokenValueKey = (0,_getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__.getTokenValueKey)(ignoreTokenFormat);
    return token[tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BOX_SHADOW && (typeof token[tokenValueKey] === "string" || Array.isArray(token[tokenValueKey]) || typeof token[tokenValueKey] === "object" && !(tokenValueKey in token[tokenValueKey]));
}
function isSingleBoxShadowTokenInJSON(token) {
    if (typeof token !== "object") return false;
    return token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.BOX_SHADOW && (typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "string" || Array.isArray(token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey]) || typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "object" && !(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleBoxShadowValue.ts":
/*!************************************************!*\
  !*** ./src/utils/is/isSingleBoxShadowValue.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleBoxShadowValue: () => (/* binding */ isSingleBoxShadowValue)
/* harmony export */ });
/* harmony import */ var _constants_BoxShadowTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/BoxShadowTypes */ "./src/constants/BoxShadowTypes.ts");

function isSingleBoxShadowValue(value) {
    return Boolean(value && (typeof value === "string" || (Array.isArray(value) ? value : [
        value
    ]).every(function(v) {
        return v && typeof v === "object" && "type" in v && "color" in v && (v.type === _constants_BoxShadowTypes__WEBPACK_IMPORTED_MODULE_0__.BoxShadowTypes.DROP_SHADOW || v.type === _constants_BoxShadowTypes__WEBPACK_IMPORTED_MODULE_0__.BoxShadowTypes.INNER_SHADOW);
    })));
}


/***/ }),

/***/ "./src/utils/is/isSingleCompositionToken.ts":
/*!**************************************************!*\
  !*** ./src/utils/is/isSingleCompositionToken.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleCompositionToken: () => (/* binding */ isSingleCompositionToken),
/* harmony export */   isSingleCompositionTokenInJSON: () => (/* binding */ isSingleCompositionTokenInJSON)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
/* harmony import */ var _getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../getTokenTypeKey */ "./src/utils/getTokenTypeKey.ts");
/* harmony import */ var _getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../getTokenValueKey */ "./src/utils/getTokenValueKey.ts");




function isSingleCompositionToken(token) {
    var ignoreTokenFormat = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    if (typeof token !== "object") return false;
    var tokenTypeKey = (0,_getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__.getTokenTypeKey)(ignoreTokenFormat);
    var tokenValueKey = (0,_getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__.getTokenValueKey)(ignoreTokenFormat);
    return token[tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.COMPOSITION && (typeof token[tokenValueKey] === "string" || typeof token[tokenValueKey] === "object" && !(tokenValueKey in token[tokenValueKey]));
}
function isSingleCompositionTokenInJSON(token) {
    if (typeof token !== "object") return false;
    return token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.COMPOSITION && (typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "string" || typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "object" && !(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleToken.ts":
/*!***************************************!*\
  !*** ./src/utils/is/isSingleToken.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleToken: () => (/* binding */ isSingleToken)
/* harmony export */ });
function isSingleToken(token) {
    return !!(token && typeof token === "object" && "value" in token && "name" in token);
}


/***/ }),

/***/ "./src/utils/is/isSingleTokenInJson.ts":
/*!*********************************************!*\
  !*** ./src/utils/is/isSingleTokenInJson.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleTokenInJSON: () => (/* binding */ isSingleTokenInJSON)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function isSingleTokenInJSON(token) {
    return !!(token && typeof token === "object" && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] !== "undefined" && token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] !== null && !(typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] === "object" && token && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleTokenValueObject.ts":
/*!**************************************************!*\
  !*** ./src/utils/is/isSingleTokenValueObject.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleTokenValueObject: () => (/* binding */ isSingleTokenValueObject)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function isSingleTokenValueObject(token) {
    return !!(token && typeof token === "object" && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] !== "undefined" && token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] !== null && !(typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] === "object" && token && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleTypographyToken.ts":
/*!*************************************************!*\
  !*** ./src/utils/is/isSingleTypographyToken.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleTypographyToken: () => (/* binding */ isSingleTypographyToken),
/* harmony export */   isSingleTypographyTokenInJSON: () => (/* binding */ isSingleTypographyTokenInJSON)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");
/* harmony import */ var _getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../getTokenTypeKey */ "./src/utils/getTokenTypeKey.ts");
/* harmony import */ var _getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../getTokenValueKey */ "./src/utils/getTokenValueKey.ts");




function isSingleTypographyToken(token) {
    var ignoreTokenFormat = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    if (typeof token !== "object") return false;
    var tokenTypeKey = (0,_getTokenTypeKey__WEBPACK_IMPORTED_MODULE_2__.getTokenTypeKey)(ignoreTokenFormat);
    var tokenValueKey = (0,_getTokenValueKey__WEBPACK_IMPORTED_MODULE_3__.getTokenValueKey)(ignoreTokenFormat);
    return token[tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.TYPOGRAPHY && (typeof token[tokenValueKey] === "string" || typeof token[tokenValueKey] === "object" && !(tokenValueKey in token[tokenValueKey]));
}
function isSingleTypographyTokenInJSON(token) {
    if (typeof token !== "object") return false;
    return token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenTypeKey] === _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes.TYPOGRAPHY && (typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "string" || typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey] === "object" && !(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_1__.TokenFormat.tokenValueKey]));
}


/***/ }),

/***/ "./src/utils/is/isSingleTypographyValue.ts":
/*!*************************************************!*\
  !*** ./src/utils/is/isSingleTypographyValue.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isSingleTypographyValue: () => (/* binding */ isSingleTypographyValue)
/* harmony export */ });
function isSingleTypographyValue(value) {
    return Boolean(value && (typeof value === "string" || (Array.isArray(value) ? value : [
        value
    ]).every(function(v) {
        return v && typeof v === "object" && ("fontFamily" in v || "fontWeight" in v || "fontSize" in v || "lineHeight" in v || "letterSpacing" in v || "paragraphSpacing" in v || "paragraphIndent" in v || "textCase" in v || "textDecoration" in v);
    })));
}


/***/ }),

/***/ "./src/utils/is/isTokenGroupWithType.ts":
/*!**********************************************!*\
  !*** ./src/utils/is/isTokenGroupWithType.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isTokenGroupWithType: () => (/* binding */ isTokenGroupWithType)
/* harmony export */ });
/* harmony import */ var _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/plugin/TokenFormatStoreClass */ "./src/plugin/TokenFormatStoreClass.ts");

function isTokenGroupWithType(token) {
    return !!(token && typeof token === "object" && (!(_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token) || _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey] === "object" && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey in token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenValueKey]) && _plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenTypeKey in token && typeof token[_plugin_TokenFormatStoreClass__WEBPACK_IMPORTED_MODULE_0__.TokenFormat.tokenTypeKey] === "string");
}


/***/ }),

/***/ "./src/utils/is/isTokenType.ts":
/*!*************************************!*\
  !*** ./src/utils/is/isTokenType.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isTokenType: () => (/* binding */ isTokenType)
/* harmony export */ });
/* harmony import */ var _constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenTypes */ "./src/constants/TokenTypes.ts");

function isTokenType(input) {
    return Object.values(_constants_TokenTypes__WEBPACK_IMPORTED_MODULE_0__.TokenTypes).includes(input);
}


/***/ }),

/***/ "./src/utils/math/checkAndEvaluateMath.ts":
/*!************************************************!*\
  !*** ./src/utils/math/checkAndEvaluateMath.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkAndEvaluateMath: () => (/* binding */ checkAndEvaluateMath)
/* harmony export */ });
/* harmony import */ var expr_eval__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! expr-eval */ "../../node_modules/expr-eval/dist/index.mjs");
/* harmony import */ var postcss_calc_ast_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! postcss-calc-ast-parser */ "../../node_modules/postcss-calc-ast-parser/dist/index.js");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}


var parser = new expr_eval__WEBPACK_IMPORTED_MODULE_0__.Parser();
/**
 * Clamps the value of x between min and max
 * @param x
 * @param min
 * @param max
 * @returns
 */ parser.functions.clamped = function(x, min, max) {
    return Math.max(Math.min(x, max), min);
};
/**
 * One dimensional linear interpolation
 * @param x Normalized value between 0 and 1
 * @param min
 * @param max
 * @returns
 */ parser.functions.lerp = function(x, start, end) {
    return start + (end - start) * x;
};
/**
 * Returns a normalized value between 0 - 1.
 * @param x
 * @param start
 * @param end
 * @returns
 */ parser.functions.norm = function(x, start, end) {
    return (x - start) / (end - start);
};
/**
 * Creates a one dimensional cubicBezier
 * @remarks We have to do a significant overhaul to the system to support multidimensional functions. Seems like expr-eval can support neither array or property accessors
 * @param x1
 * @param x2
 * @returns
 */ parser.functions.cubicBezier1D = function(x1, x2) {
    var xx = [
        0,
        x1,
        x2,
        1
    ];
    return function(t) {
        var coeffs = [
            Math.pow(1 - t, 3),
            3 * Math.pow(1 - t, 2) * t,
            3 * (1 - t) * Math.pow(t, 2),
            Math.pow(t, 3)
        ];
        var x = coeffs.reduce(function(acc, c, i) {
            return acc + c * xx[i];
        }, 0);
        return x;
    };
};
// eslint-disable-next-line
parser.functions.sample = function(func) {
    for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        args[_key - 1] = arguments[_key];
    }
    return func.apply(void 0, _to_consumable_array(args));
};
function checkAndEvaluateMath(expr) {
    var calcParsed;
    try {
        calcParsed = postcss_calc_ast_parser__WEBPACK_IMPORTED_MODULE_1__["default"].parse(expr);
    } catch (ex) {
        return expr;
    }
    var calcReduced = postcss_calc_ast_parser__WEBPACK_IMPORTED_MODULE_1__["default"].reduceExpression(calcParsed);
    var unitlessExpr = expr;
    var unit;
    if (calcReduced && calcReduced.type !== "Number") {
        unitlessExpr = expr.replace(new RegExp(calcReduced.unit, "ig"), "");
        unit = calcReduced.unit;
    }
    var evaluated;
    try {
        evaluated = parser.evaluate("".concat(unitlessExpr));
    } catch (ex) {
        return expr;
    }
    try {
        return unit ? "".concat(evaluated).concat(unit) : Number.parseFloat(evaluated.toFixed(3));
    } catch (ex) {
        return expr;
    }
}


/***/ }),

/***/ "./src/utils/math/index.ts":
/*!*********************************!*\
  !*** ./src/utils/math/index.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   checkAndEvaluateMath: () => (/* reexport safe */ _checkAndEvaluateMath__WEBPACK_IMPORTED_MODULE_0__.checkAndEvaluateMath)
/* harmony export */ });
/* harmony import */ var _checkAndEvaluateMath__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./checkAndEvaluateMath */ "./src/utils/math/checkAndEvaluateMath.ts");



/***/ }),

/***/ "./src/utils/modifyColor.ts":
/*!**********************************!*\
  !*** ./src/utils/modifyColor.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   modifyColor: () => (/* binding */ modifyColor)
/* harmony export */ });
/* harmony import */ var colorjs_io__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! colorjs.io */ "../../node_modules/colorjs.io/dist/color.js");
/* harmony import */ var _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/ColorModifierTypes */ "./src/constants/ColorModifierTypes.ts");
/* harmony import */ var _color_transparentize__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./color/transparentize */ "./src/utils/color/transparentize.ts");
/* harmony import */ var _color_mix__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./color/mix */ "./src/utils/color/mix.ts");
/* harmony import */ var _color_darken__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./color/darken */ "./src/utils/color/darken.ts");
/* harmony import */ var _color_lighten__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./color/lighten */ "./src/utils/color/lighten.ts");






function modifyColor(baseColor, modifier) {
    var color = new colorjs_io__WEBPACK_IMPORTED_MODULE_5__["default"](baseColor);
    var returnedColor = color;
    try {
        switch(modifier.type){
            case _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_0__.ColorModifierTypes.LIGHTEN:
                returnedColor = (0,_color_lighten__WEBPACK_IMPORTED_MODULE_4__.lighten)(color, modifier.space, Number(modifier.value));
                break;
            case _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_0__.ColorModifierTypes.DARKEN:
                returnedColor = (0,_color_darken__WEBPACK_IMPORTED_MODULE_3__.darken)(color, modifier.space, Number(modifier.value));
                break;
            case _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_0__.ColorModifierTypes.MIX:
                returnedColor = (0,_color_mix__WEBPACK_IMPORTED_MODULE_2__.mix)(color, modifier.space, Number(modifier.value), new colorjs_io__WEBPACK_IMPORTED_MODULE_5__["default"](modifier.color));
                break;
            case _constants_ColorModifierTypes__WEBPACK_IMPORTED_MODULE_0__.ColorModifierTypes.ALPHA:
                {
                    returnedColor = (0,_color_transparentize__WEBPACK_IMPORTED_MODULE_1__.transparentize)(color, Number(modifier.value));
                    break;
                }
            default:
                returnedColor = color;
                break;
        }
        returnedColor = returnedColor.to(modifier.space);
        return returnedColor.toString({
            inGamut: true,
            precision: 3
        });
    } catch (e) {
        return baseColor;
    }
}


/***/ }),

/***/ "./src/utils/parseTokenValues.ts":
/*!***************************************!*\
  !*** ./src/utils/parseTokenValues.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ parseTokenValues)
/* harmony export */ });
/* harmony import */ var _convertTokens__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./convertTokens */ "./src/utils/convertTokens.tsx");
/* harmony import */ var _detectFormat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./detectFormat */ "./src/utils/detectFormat.tsx");


function parseTokenValues(tokens) {
    // If we receive an array of tokens, move them all to the global set
    if (Array.isArray(tokens)) {
        return {
            global: tokens
        };
    }
    var reducedTokens = Object.entries(tokens).reduce(function(prev, group) {
        var parsedGroup = group[1];
        if (Array.isArray(parsedGroup)) {
            prev.push([
                group[0],
                parsedGroup
            ]);
            return prev;
        }
        if (typeof parsedGroup === "object") {
            (0,_detectFormat__WEBPACK_IMPORTED_MODULE_1__.detectFormat)(parsedGroup, true);
            var convertedToArray = (0,_convertTokens__WEBPACK_IMPORTED_MODULE_0__["default"])({
                tokens: parsedGroup
            });
            prev.push([
                group[0],
                convertedToArray
            ]);
            return prev;
        }
        return prev;
    }, []);
    return Object.fromEntries(reducedTokens);
}


/***/ }),

/***/ "./src/utils/sortSets.ts":
/*!*******************************!*\
  !*** ./src/utils/sortSets.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sortSets: () => (/* binding */ sortSets)
/* harmony export */ });
/* harmony import */ var _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/constants/TokenSetStatus */ "./src/constants/TokenSetStatus.ts");

// Helper function to sort token sets based on their status in the configuration. Basically, ENABLED and SOURCE sets are treated equally and come before DISABLED.
function sortSets(a, b, config) {
    // Get the status of each set, defaulting to DISABLED if not found in config
    var statusA = config[a] || _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.DISABLED;
    var statusB = config[b] || _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.DISABLED;
    // If both sets have the same status, maintain their original order
    if (statusA === statusB) return 0;
    // DISABLED sets should come before ENABLED and SOURCE, which are treated equally
    if (statusA === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.DISABLED && (statusB === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.ENABLED || statusB === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.SOURCE)) return -1;
    if ((statusA === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.ENABLED || statusA === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.SOURCE) && statusB === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_0__.TokenSetStatus.DISABLED) return 1;
    // If we reach here, it means both are ENABLED or SOURCE, or both are DISABLED
    return 0;
}


/***/ }),

/***/ "./src/utils/tokenHelpers.ts":
/*!***********************************!*\
  !*** ./src/utils/tokenHelpers.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getEnabledTokenSets: () => (/* binding */ getEnabledTokenSets),
/* harmony export */   getOverallConfig: () => (/* binding */ getOverallConfig),
/* harmony export */   mergeTokenGroups: () => (/* binding */ mergeTokenGroups)
/* harmony export */ });
/* harmony import */ var _app_components_createTokenObj__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @/app/components/createTokenObj */ "./src/app/components/createTokenObj.tsx");
/* harmony import */ var _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @/constants/TokenSetStatus */ "./src/constants/TokenSetStatus.ts");
/* harmony import */ var _getTokenSetsOrder__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./getTokenSetsOrder */ "./src/utils/getTokenSetsOrder.ts");
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) {
            symbols = symbols.filter(function(sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
        }
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _object_spread_props(target, source) {
    source = source != null ? source : {};
    if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
        ownKeys(Object(source)).forEach(function(key) {
            Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}



function getOverallConfig(themes, selectedThemes) {
    return selectedThemes.reduce(function(acc, themeId) {
        var currentTheme = themes.find(function(theme) {
            return theme.id === themeId;
        });
        if (!currentTheme) return acc;
        Object.entries(currentTheme.selectedTokenSets).forEach(function(param) {
            var _param = _sliced_to_array(param, 2), tokenSet = _param[0], status = _param[1];
            // If the set is enabled, set it. Meaning, it should always win.
            if (status === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_1__.TokenSetStatus.ENABLED) {
                acc[tokenSet] = status;
            // If the set is source, only set it to source if it wasnt set to enabled.
            } else if (status === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_1__.TokenSetStatus.SOURCE && acc[tokenSet] !== _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_1__.TokenSetStatus.ENABLED) {
                acc[tokenSet] = status;
            }
        });
        return acc;
    }, {});
}
function getEnabledTokenSets() {
    var usedSets = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    return Object.keys(usedSets).filter(function(key) {
        return usedSets[key] === _constants_TokenSetStatus__WEBPACK_IMPORTED_MODULE_1__.TokenSetStatus.ENABLED;
    }).map(function(tokenSet) {
        return tokenSet;
    });
}
function mergeTokenGroups(tokens) {
    var usedSets = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, overallConfig = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, activeTokenSet = arguments.length > 3 ? arguments[3] : void 0;
    var _getTokenSetsOrder = (0,_getTokenSetsOrder__WEBPACK_IMPORTED_MODULE_2__.getTokenSetsOrder)(tokens, usedSets, overallConfig, activeTokenSet), tokenSetsOrder = _getTokenSetsOrder.tokenSetsOrder, usedSetsList = _getTokenSetsOrder.usedSetsList, overallSets = _getTokenSetsOrder.overallSets;
    // Helper to determine if a token should be merged. We only merge object tokens if the current set is enabled (to avoid accidental merges)
    var shouldMerge = function(currentSet, existingToken) {
        return usedSetsList.includes(currentSet) && existingToken.internal__Parent && !overallSets.includes(existingToken.internal__Parent);
    };
    return tokenSetsOrder.reduce(function(mergedTokens, setName) {
        var setTokens = tokens[setName] || [];
        setTokens.forEach(function(token) {
            var existingIndex = mergedTokens.findIndex(function(t) {
                return t.name === token.name;
            });
            var existingToken = mergedTokens[existingIndex];
            var newToken = _object_spread_props(_object_spread({}, (0,_app_components_createTokenObj__WEBPACK_IMPORTED_MODULE_0__.appendTypeToToken)(token)), {
                internal__Parent: setName
            });
            if (existingIndex === -1) {
                // If the token does not exist yet, add it.
                mergedTokens.push(newToken);
            } else if (shouldMerge(setName, existingToken) && existingIndex > -1 && typeof existingToken.value === "object" && typeof newToken.value === "object" && !Array.isArray(existingToken.value) && !Array.isArray(newToken.value)) {
                // If the token should be merged, and is an object - and not an array, merge them (e.g. composition, typography)
                mergedTokens.splice(existingIndex, 1, _object_spread_props(_object_spread({}, newToken), {
                    value: _object_spread({}, existingToken.value, newToken.value)
                }));
            } else {
                // In all other cases, just replace.
                mergedTokens[existingIndex] = newToken;
            }
        });
        return mergedTokens;
    }, []);
}


/***/ }),

/***/ "./src/utils/transform.ts":
/*!********************************!*\
  !*** ./src/utils/transform.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _convertTokensObjectToResolved__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./convertTokensObjectToResolved */ "./src/utils/convertTokensObjectToResolved.ts");

function transform(input, sets, excludes, options) {
    return (0,_convertTokensObjectToResolved__WEBPACK_IMPORTED_MODULE_0__["default"])(input, sets, excludes, options);
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (transform);


/***/ }),

/***/ "./node_modules/set-value/index.js":
/*!*****************************************!*\
  !*** ./node_modules/set-value/index.js ***!
  \*****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*!
 * set-value <https://github.com/jonschlinkert/set-value>
 *
 * Copyright (c) 2014-2018, Jon Schlinkert.
 * Released under the MIT License.
 */



const isPlain = __webpack_require__(/*! is-plain-object */ "../../node_modules/is-plain-object/index.js");

function set(target, path, value, options) {
  if (!isObject(target)) {
    return target;
  }

  let opts = options || {};
  const isArray = Array.isArray(path);
  if (!isArray && typeof path !== 'string') {
    return target;
  }

  let merge = opts.merge;
  if (merge && typeof merge !== 'function') {
    merge = Object.assign;
  }

  const keys = (isArray ? path : split(path, opts)).filter(isValidKey);
  const len = keys.length;
  const orig = target;

  if (!options && keys.length === 1) {
    result(target, keys[0], value, merge);
    return target;
  }

  for (let i = 0; i < len; i++) {
    let prop = keys[i];

    if (!isObject(target[prop])) {
      target[prop] = {};
    }

    if (i === len - 1) {
      result(target, prop, value, merge);
      break;
    }

    target = target[prop];
  }

  return orig;
}

function result(target, path, value, merge) {
  if (merge && isPlain(target[path]) && isPlain(value)) {
    target[path] = merge({}, target[path], value);
  } else {
    target[path] = value;
  }
}

function split(path, options) {
  const id = createKey(path, options);
  if (set.memo[id]) return set.memo[id];

  const char = (options && options.separator) ? options.separator : '.';
  let keys = [];
  let res = [];

  if (options && typeof options.split === 'function') {
    keys = options.split(path);
  } else {
    keys = path.split(char);
  }

  for (let i = 0; i < keys.length; i++) {
    let prop = keys[i];
    while (prop && prop.slice(-1) === '\\' && keys[i + 1] != null) {
      prop = prop.slice(0, -1) + char + keys[++i];
    }
    res.push(prop);
  }
  set.memo[id] = res;
  return res;
}

function createKey(pattern, options) {
  let id = pattern;
  if (typeof options === 'undefined') {
    return id + '';
  }
  const keys = Object.keys(options);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    id += ';' + key + '=' + String(options[key]);
  }
  return id;
}

function isValidKey(key) {
  if (typeof key !== 'string' && typeof key !== 'number') {
    key = String(key);
  }

  return key !== '__proto__' && key !== 'constructor' && key !== 'prototype';
}

function isObject(val) {
  return val !== null && (typeof val === 'object' || typeof val === 'function');
}

set.memo = {};
module.exports = set;


/***/ }),

/***/ "../../node_modules/color2k/dist/index.exports.import.es.mjs":
/*!*******************************************************************!*\
  !*** ../../node_modules/color2k/dist/index.exports.import.es.mjs ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorError: () => (/* binding */ ColorError$1),
/* harmony export */   adjustHue: () => (/* binding */ adjustHue),
/* harmony export */   darken: () => (/* binding */ darken),
/* harmony export */   desaturate: () => (/* binding */ desaturate),
/* harmony export */   getContrast: () => (/* binding */ getContrast),
/* harmony export */   getLuminance: () => (/* binding */ getLuminance),
/* harmony export */   getScale: () => (/* binding */ getScale),
/* harmony export */   guard: () => (/* binding */ guard),
/* harmony export */   hasBadContrast: () => (/* binding */ hasBadContrast),
/* harmony export */   hsla: () => (/* binding */ hsla),
/* harmony export */   lighten: () => (/* binding */ lighten),
/* harmony export */   mix: () => (/* binding */ mix),
/* harmony export */   opacify: () => (/* binding */ opacify),
/* harmony export */   parseToHsla: () => (/* binding */ parseToHsla),
/* harmony export */   parseToRgba: () => (/* binding */ parseToRgba),
/* harmony export */   readableColor: () => (/* binding */ readableColor),
/* harmony export */   readableColorIsBlack: () => (/* binding */ readableColorIsBlack),
/* harmony export */   rgba: () => (/* binding */ rgba),
/* harmony export */   saturate: () => (/* binding */ saturate),
/* harmony export */   toHex: () => (/* binding */ toHex),
/* harmony export */   toHsla: () => (/* binding */ toHsla),
/* harmony export */   toRgba: () => (/* binding */ toRgba),
/* harmony export */   transparentize: () => (/* binding */ transparentize)
/* harmony export */ });
/**
 * A simple guard function:
 *
 * ```js
 * Math.min(Math.max(low, value), high)
 * ```
 */
function guard(low, high, value) {
  return Math.min(Math.max(low, value), high);
}

class ColorError extends Error {
  constructor(color) {
    super(`Failed to parse color: "${color}"`);
  }
}
var ColorError$1 = ColorError;

/**
 * Parses a color into red, gree, blue, alpha parts
 *
 * @param color the input color. Can be a RGB, RBGA, HSL, HSLA, or named color
 */
function parseToRgba(color) {
  if (typeof color !== 'string') throw new ColorError$1(color);
  if (color.trim().toLowerCase() === 'transparent') return [0, 0, 0, 0];
  let normalizedColor = color.trim();
  normalizedColor = namedColorRegex.test(color) ? nameToHex(color) : color;
  const reducedHexMatch = reducedHexRegex.exec(normalizedColor);
  if (reducedHexMatch) {
    const arr = Array.from(reducedHexMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(r(x, 2), 16)), parseInt(r(arr[3] || 'f', 2), 16) / 255];
  }
  const hexMatch = hexRegex.exec(normalizedColor);
  if (hexMatch) {
    const arr = Array.from(hexMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(x, 16)), parseInt(arr[3] || 'ff', 16) / 255];
  }
  const rgbaMatch = rgbaRegex.exec(normalizedColor);
  if (rgbaMatch) {
    const arr = Array.from(rgbaMatch).slice(1);
    return [...arr.slice(0, 3).map(x => parseInt(x, 10)), parseFloat(arr[3] || '1')];
  }
  const hslaMatch = hslaRegex.exec(normalizedColor);
  if (hslaMatch) {
    const [h, s, l, a] = Array.from(hslaMatch).slice(1).map(parseFloat);
    if (guard(0, 100, s) !== s) throw new ColorError$1(color);
    if (guard(0, 100, l) !== l) throw new ColorError$1(color);
    return [...hslToRgb(h, s, l), Number.isNaN(a) ? 1 : a];
  }
  throw new ColorError$1(color);
}
function hash(str) {
  let hash = 5381;
  let i = str.length;
  while (i) {
    hash = hash * 33 ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */
  return (hash >>> 0) % 2341;
}
const colorToInt = x => parseInt(x.replace(/_/g, ''), 36);
const compressedColorMap = '1q29ehhb 1n09sgk7 1kl1ekf_ _yl4zsno 16z9eiv3 1p29lhp8 _bd9zg04 17u0____ _iw9zhe5 _to73___ _r45e31e _7l6g016 _jh8ouiv _zn3qba8 1jy4zshs 11u87k0u 1ro9yvyo 1aj3xael 1gz9zjz0 _3w8l4xo 1bf1ekf_ _ke3v___ _4rrkb__ 13j776yz _646mbhl _nrjr4__ _le6mbhl 1n37ehkb _m75f91n _qj3bzfz 1939yygw 11i5z6x8 _1k5f8xs 1509441m 15t5lwgf _ae2th1n _tg1ugcv 1lp1ugcv 16e14up_ _h55rw7n _ny9yavn _7a11xb_ 1ih442g9 _pv442g9 1mv16xof 14e6y7tu 1oo9zkds 17d1cisi _4v9y70f _y98m8kc 1019pq0v 12o9zda8 _348j4f4 1et50i2o _8epa8__ _ts6senj 1o350i2o 1mi9eiuo 1259yrp0 1ln80gnw _632xcoy 1cn9zldc _f29edu4 1n490c8q _9f9ziet 1b94vk74 _m49zkct 1kz6s73a 1eu9dtog _q58s1rz 1dy9sjiq __u89jo3 _aj5nkwg _ld89jo3 13h9z6wx _qa9z2ii _l119xgq _bs5arju 1hj4nwk9 1qt4nwk9 1ge6wau6 14j9zlcw 11p1edc_ _ms1zcxe _439shk6 _jt9y70f _754zsow 1la40eju _oq5p___ _x279qkz 1fa5r3rv _yd2d9ip _424tcku _8y1di2_ _zi2uabw _yy7rn9h 12yz980_ __39ljp6 1b59zg0x _n39zfzp 1fy9zest _b33k___ _hp9wq92 1il50hz4 _io472ub _lj9z3eo 19z9ykg0 _8t8iu3a 12b9bl4a 1ak5yw0o _896v4ku _tb8k8lv _s59zi6t _c09ze0p 1lg80oqn 1id9z8wb _238nba5 1kq6wgdi _154zssg _tn3zk49 _da9y6tc 1sg7cv4f _r12jvtt 1gq5fmkz 1cs9rvci _lp9jn1c _xw1tdnb 13f9zje6 16f6973h _vo7ir40 _bt5arjf _rc45e4t _hr4e100 10v4e100 _hc9zke2 _w91egv_ _sj2r1kk 13c87yx8 _vqpds__ _ni8ggk8 _tj9yqfb 1ia2j4r4 _7x9b10u 1fc9ld4j 1eq9zldr _5j9lhpx _ez9zl6o _md61fzm'.split(' ').reduce((acc, next) => {
  const key = colorToInt(next.substring(0, 3));
  const hex = colorToInt(next.substring(3)).toString(16);

  // NOTE: padStart could be used here but it breaks Node 6 compat
  // https://github.com/ricokahler/color2k/issues/351
  let prefix = '';
  for (let i = 0; i < 6 - hex.length; i++) {
    prefix += '0';
  }
  acc[key] = `${prefix}${hex}`;
  return acc;
}, {});

/**
 * Checks if a string is a CSS named color and returns its equivalent hex value, otherwise returns the original color.
 */
function nameToHex(color) {
  const normalizedColorName = color.toLowerCase().trim();
  const result = compressedColorMap[hash(normalizedColorName)];
  if (!result) throw new ColorError$1(color);
  return `#${result}`;
}
const r = (str, amount) => Array.from(Array(amount)).map(() => str).join('');
const reducedHexRegex = new RegExp(`^#${r('([a-f0-9])', 3)}([a-f0-9])?$`, 'i');
const hexRegex = new RegExp(`^#${r('([a-f0-9]{2})', 3)}([a-f0-9]{2})?$`, 'i');
const rgbaRegex = new RegExp(`^rgba?\\(\\s*(\\d+)\\s*${r(',\\s*(\\d+)\\s*', 2)}(?:,\\s*([\\d.]+))?\\s*\\)$`, 'i');
const hslaRegex = /^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([\d.]+))?\s*\)$/i;
const namedColorRegex = /^[a-z]+$/i;
const roundColor = color => {
  return Math.round(color * 255);
};
const hslToRgb = (hue, saturation, lightness) => {
  let l = lightness / 100;
  if (saturation === 0) {
    // achromatic
    return [l, l, l].map(roundColor);
  }

  // formulae from https://en.wikipedia.org/wiki/HSL_and_HSV
  const huePrime = (hue % 360 + 360) % 360 / 60;
  const chroma = (1 - Math.abs(2 * l - 1)) * (saturation / 100);
  const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
  let red = 0;
  let green = 0;
  let blue = 0;
  if (huePrime >= 0 && huePrime < 1) {
    red = chroma;
    green = secondComponent;
  } else if (huePrime >= 1 && huePrime < 2) {
    red = secondComponent;
    green = chroma;
  } else if (huePrime >= 2 && huePrime < 3) {
    green = chroma;
    blue = secondComponent;
  } else if (huePrime >= 3 && huePrime < 4) {
    green = secondComponent;
    blue = chroma;
  } else if (huePrime >= 4 && huePrime < 5) {
    red = secondComponent;
    blue = chroma;
  } else if (huePrime >= 5 && huePrime < 6) {
    red = chroma;
    blue = secondComponent;
  }
  const lightnessModification = l - chroma / 2;
  const finalRed = red + lightnessModification;
  const finalGreen = green + lightnessModification;
  const finalBlue = blue + lightnessModification;
  return [finalRed, finalGreen, finalBlue].map(roundColor);
};

// taken from:

/**
 * Parses a color in hue, saturation, lightness, and the alpha channel.
 *
 * Hue is a number between 0 and 360, saturation, lightness, and alpha are
 * decimal percentages between 0 and 1
 */
function parseToHsla(color) {
  const [red, green, blue, alpha] = parseToRgba(color).map((value, index) =>
  // 3rd index is alpha channel which is already normalized
  index === 3 ? value : value / 255);
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  // achromatic
  if (max === min) return [0, 0, lightness, alpha];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue = 60 * (red === max ? (green - blue) / delta + (green < blue ? 6 : 0) : green === max ? (blue - red) / delta + 2 : (red - green) / delta + 4);
  return [hue, saturation, lightness, alpha];
}

/**
 * Takes in hsla parts and constructs an hsla string
 *
 * @param hue The color circle (from 0 to 360) - 0 (or 360) is red, 120 is green, 240 is blue
 * @param saturation Percentage of saturation, given as a decimal between 0 and 1
 * @param lightness Percentage of lightness, given as a decimal between 0 and 1
 * @param alpha Percentage of opacity, given as a decimal between 0 and 1
 */
function hsla(hue, saturation, lightness, alpha) {
  return `hsla(${(hue % 360).toFixed()}, ${guard(0, 100, saturation * 100).toFixed()}%, ${guard(0, 100, lightness * 100).toFixed()}%, ${parseFloat(guard(0, 1, alpha).toFixed(3))})`;
}

/**
 * Adjusts the current hue of the color by the given degrees. Wraps around when
 * over 360.
 *
 * @param color input color
 * @param degrees degrees to adjust the input color, accepts degree integers
 * (0 - 360) and wraps around on overflow
 */
function adjustHue(color, degrees) {
  const [h, s, l, a] = parseToHsla(color);
  return hsla(h + degrees, s, l, a);
}

/**
 * Darkens using lightness. This is equivalent to subtracting the lightness
 * from the L in HSL.
 *
 * @param amount The amount to darken, given as a decimal between 0 and 1
 */
function darken(color, amount) {
  const [hue, saturation, lightness, alpha] = parseToHsla(color);
  return hsla(hue, saturation, lightness - amount, alpha);
}

/**
 * Desaturates the input color by the given amount via subtracting from the `s`
 * in `hsla`.
 *
 * @param amount The amount to desaturate, given as a decimal between 0 and 1
 */
function desaturate(color, amount) {
  const [h, s, l, a] = parseToHsla(color);
  return hsla(h, s - amount, l, a);
}

// taken from:
// https://github.com/styled-components/polished/blob/0764c982551b487469043acb56281b0358b3107b/src/color/getLuminance.js

/**
 * Returns a number (float) representing the luminance of a color.
 */
function getLuminance(color) {
  if (color === 'transparent') return 0;
  function f(x) {
    const channel = x / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  }
  const [r, g, b] = parseToRgba(color);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

// taken from:

/**
 * Returns the contrast ratio between two colors based on
 * [W3's recommended equation for calculating contrast](http://www.w3.org/TR/WCAG20/#contrast-ratiodef).
 */
function getContrast(color1, color2) {
  const luminance1 = getLuminance(color1);
  const luminance2 = getLuminance(color2);
  return luminance1 > luminance2 ? (luminance1 + 0.05) / (luminance2 + 0.05) : (luminance2 + 0.05) / (luminance1 + 0.05);
}

/**
 * Takes in rgba parts and returns an rgba string
 *
 * @param red The amount of red in the red channel, given in a number between 0 and 255 inclusive
 * @param green The amount of green in the red channel, given in a number between 0 and 255 inclusive
 * @param blue The amount of blue in the red channel, given in a number between 0 and 255 inclusive
 * @param alpha Percentage of opacity, given as a decimal between 0 and 1
 */
function rgba(red, green, blue, alpha) {
  return `rgba(${guard(0, 255, red).toFixed()}, ${guard(0, 255, green).toFixed()}, ${guard(0, 255, blue).toFixed()}, ${parseFloat(guard(0, 1, alpha).toFixed(3))})`;
}

/**
 * Mixes two colors together. Taken from sass's implementation.
 */
function mix(color1, color2, weight) {
  const normalize = (n, index) =>
  // 3rd index is alpha channel which is already normalized
  index === 3 ? n : n / 255;
  const [r1, g1, b1, a1] = parseToRgba(color1).map(normalize);
  const [r2, g2, b2, a2] = parseToRgba(color2).map(normalize);

  // The formula is copied from the original Sass implementation:
  // http://sass-lang.com/documentation/Sass/Script/Functions.html#mix-instance_method
  const alphaDelta = a2 - a1;
  const normalizedWeight = weight * 2 - 1;
  const combinedWeight = normalizedWeight * alphaDelta === -1 ? normalizedWeight : normalizedWeight + alphaDelta / (1 + normalizedWeight * alphaDelta);
  const weight2 = (combinedWeight + 1) / 2;
  const weight1 = 1 - weight2;
  const r = (r1 * weight1 + r2 * weight2) * 255;
  const g = (g1 * weight1 + g2 * weight2) * 255;
  const b = (b1 * weight1 + b2 * weight2) * 255;
  const a = a2 * weight + a1 * (1 - weight);
  return rgba(r, g, b, a);
}

/**
 * Given a series colors, this function will return a `scale(x)` function that
 * accepts a percentage as a decimal between 0 and 1 and returns the color at
 * that percentage in the scale.
 *
 * ```js
 * const scale = getScale('red', 'yellow', 'green');
 * console.log(scale(0)); // rgba(255, 0, 0, 1)
 * console.log(scale(0.5)); // rgba(255, 255, 0, 1)
 * console.log(scale(1)); // rgba(0, 128, 0, 1)
 * ```
 *
 * If you'd like to limit the domain and range like chroma-js, we recommend
 * wrapping scale again.
 *
 * ```js
 * const _scale = getScale('red', 'yellow', 'green');
 * const scale = x => _scale(x / 100);
 *
 * console.log(scale(0)); // rgba(255, 0, 0, 1)
 * console.log(scale(50)); // rgba(255, 255, 0, 1)
 * console.log(scale(100)); // rgba(0, 128, 0, 1)
 * ```
 */
function getScale(...colors) {
  return n => {
    const lastIndex = colors.length - 1;
    const lowIndex = guard(0, lastIndex, Math.floor(n * lastIndex));
    const highIndex = guard(0, lastIndex, Math.ceil(n * lastIndex));
    const color1 = colors[lowIndex];
    const color2 = colors[highIndex];
    const unit = 1 / lastIndex;
    const weight = (n - unit * lowIndex) / unit;
    return mix(color1, color2, weight);
  };
}

const guidelines = {
  decorative: 1.5,
  readable: 3,
  aa: 4.5,
  aaa: 7
};

/**
 * Returns whether or not a color has bad contrast against a background
 * according to a given standard.
 */
function hasBadContrast(color, standard = 'aa', background = '#fff') {
  return getContrast(color, background) < guidelines[standard];
}

/**
 * Lightens a color by a given amount. This is equivalent to
 * `darken(color, -amount)`
 *
 * @param amount The amount to darken, given as a decimal between 0 and 1
 */
function lighten(color, amount) {
  return darken(color, -amount);
}

/**
 * Takes in a color and makes it more transparent by convert to `rgba` and
 * decreasing the amount in the alpha channel.
 *
 * @param amount The amount to increase the transparency by, given as a decimal between 0 and 1
 */
function transparentize(color, amount) {
  const [r, g, b, a] = parseToRgba(color);
  return rgba(r, g, b, a - amount);
}

/**
 * Takes a color and un-transparentizes it. Equivalent to
 * `transparentize(color, -amount)`
 *
 * @param amount The amount to increase the opacity by, given as a decimal between 0 and 1
 */
function opacify(color, amount) {
  return transparentize(color, -amount);
}

/**
 * An alternative function to `readableColor`. Returns whether or not the 
 * readable color (i.e. the color to be place on top the input color) should be
 * black.
 */
function readableColorIsBlack(color) {
  return getLuminance(color) > 0.179;
}

/**
 * Returns black or white for best contrast depending on the luminosity of the
 * given color.
 */
function readableColor(color) {
  return readableColorIsBlack(color) ? '#000' : '#fff';
}

/**
 * Saturates a color by converting it to `hsl` and increasing the saturation
 * amount. Equivalent to `desaturate(color, -amount)`
 * 
 * @param color Input color
 * @param amount The amount to darken, given as a decimal between 0 and 1
 */
function saturate(color, amount) {
  return desaturate(color, -amount);
}

/**
 * Takes in any color and returns it as a hex code.
 */
function toHex(color) {
  const [r, g, b, a] = parseToRgba(color);
  let hex = x => {
    const h = guard(0, 255, x).toString(16);
    // NOTE: padStart could be used here but it breaks Node 6 compat
    // https://github.com/ricokahler/color2k/issues/351
    return h.length === 1 ? `0${h}` : h;
  };
  return `#${hex(r)}${hex(g)}${hex(b)}${a < 1 ? hex(Math.round(a * 255)) : ''}`;
}

/**
 * Takes in any color and returns it as an rgba string.
 */
function toRgba(color) {
  return rgba(...parseToRgba(color));
}

/**
 * Takes in any color and returns it as an hsla string.
 */
function toHsla(color) {
  return hsla(...parseToHsla(color));
}


//# sourceMappingURL=index.exports.import.es.mjs.map


/***/ }),

/***/ "../../node_modules/expr-eval/dist/index.mjs":
/*!***************************************************!*\
  !*** ../../node_modules/expr-eval/dist/index.mjs ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Expression: () => (/* binding */ Expression),
/* harmony export */   Parser: () => (/* binding */ Parser),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var INUMBER = 'INUMBER';
var IOP1 = 'IOP1';
var IOP2 = 'IOP2';
var IOP3 = 'IOP3';
var IVAR = 'IVAR';
var IVARNAME = 'IVARNAME';
var IFUNCALL = 'IFUNCALL';
var IFUNDEF = 'IFUNDEF';
var IEXPR = 'IEXPR';
var IEXPREVAL = 'IEXPREVAL';
var IMEMBER = 'IMEMBER';
var IENDSTATEMENT = 'IENDSTATEMENT';
var IARRAY = 'IARRAY';

function Instruction(type, value) {
  this.type = type;
  this.value = (value !== undefined && value !== null) ? value : 0;
}

Instruction.prototype.toString = function () {
  switch (this.type) {
    case INUMBER:
    case IOP1:
    case IOP2:
    case IOP3:
    case IVAR:
    case IVARNAME:
    case IENDSTATEMENT:
      return this.value;
    case IFUNCALL:
      return 'CALL ' + this.value;
    case IFUNDEF:
      return 'DEF ' + this.value;
    case IARRAY:
      return 'ARRAY ' + this.value;
    case IMEMBER:
      return '.' + this.value;
    default:
      return 'Invalid Instruction';
  }
};

function unaryInstruction(value) {
  return new Instruction(IOP1, value);
}

function binaryInstruction(value) {
  return new Instruction(IOP2, value);
}

function ternaryInstruction(value) {
  return new Instruction(IOP3, value);
}

function simplify(tokens, unaryOps, binaryOps, ternaryOps, values) {
  var nstack = [];
  var newexpression = [];
  var n1, n2, n3;
  var f;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      if (Array.isArray(item.value)) {
        nstack.push.apply(nstack, simplify(item.value.map(function (x) {
          return new Instruction(INUMBER, x);
        }).concat(new Instruction(IARRAY, item.value.length)), unaryOps, binaryOps, ternaryOps, values));
      } else {
        nstack.push(item);
      }
    } else if (type === IVAR && values.hasOwnProperty(item.value)) {
      item = new Instruction(INUMBER, values[item.value]);
      nstack.push(item);
    } else if (type === IOP2 && nstack.length > 1) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = binaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value, n2.value));
      nstack.push(item);
    } else if (type === IOP3 && nstack.length > 2) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(n1.value ? n2.value : n3.value);
      } else {
        f = ternaryOps[item.value];
        item = new Instruction(INUMBER, f(n1.value, n2.value, n3.value));
        nstack.push(item);
      }
    } else if (type === IOP1 && nstack.length > 0) {
      n1 = nstack.pop();
      f = unaryOps[item.value];
      item = new Instruction(INUMBER, f(n1.value));
      nstack.push(item);
    } else if (type === IEXPR) {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(new Instruction(IEXPR, simplify(item.value, unaryOps, binaryOps, ternaryOps, values)));
    } else if (type === IMEMBER && nstack.length > 0) {
      n1 = nstack.pop();
      nstack.push(new Instruction(INUMBER, n1.value[item.value]));
    } /* else if (type === IARRAY && nstack.length >= item.value) {
      var length = item.value;
      while (length-- > 0) {
        newexpression.push(nstack.pop());
      }
      newexpression.push(new Instruction(IARRAY, item.value));
    } */ else {
      while (nstack.length > 0) {
        newexpression.push(nstack.shift());
      }
      newexpression.push(item);
    }
  }
  while (nstack.length > 0) {
    newexpression.push(nstack.shift());
  }
  return newexpression;
}

function substitute(tokens, variable, expr) {
  var newexpression = [];
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === IVAR && item.value === variable) {
      for (var j = 0; j < expr.tokens.length; j++) {
        var expritem = expr.tokens[j];
        var replitem;
        if (expritem.type === IOP1) {
          replitem = unaryInstruction(expritem.value);
        } else if (expritem.type === IOP2) {
          replitem = binaryInstruction(expritem.value);
        } else if (expritem.type === IOP3) {
          replitem = ternaryInstruction(expritem.value);
        } else {
          replitem = new Instruction(expritem.type, expritem.value);
        }
        newexpression.push(replitem);
      }
    } else if (type === IEXPR) {
      newexpression.push(new Instruction(IEXPR, substitute(item.value, variable, expr)));
    } else {
      newexpression.push(item);
    }
  }
  return newexpression;
}

function evaluate(tokens, expr, values) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;

  if (isExpressionEvaluator(tokens)) {
    return resolveExpression(tokens, values);
  }

  var numTokens = tokens.length;

  for (var i = 0; i < numTokens; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === 'and') {
        nstack.push(n1 ? !!evaluate(n2, expr, values) : false);
      } else if (item.value === 'or') {
        nstack.push(n1 ? true : !!evaluate(n2, expr, values));
      } else if (item.value === '=') {
        f = expr.binaryOps[item.value];
        nstack.push(f(n1, evaluate(n2, expr, values), values));
      } else {
        f = expr.binaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values)));
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      if (item.value === '?') {
        nstack.push(evaluate(n1 ? n2 : n3, expr, values));
      } else {
        f = expr.ternaryOps[item.value];
        nstack.push(f(resolveExpression(n1, values), resolveExpression(n2, values), resolveExpression(n3, values)));
      }
    } else if (type === IVAR) {
      if (item.value in expr.functions) {
        nstack.push(expr.functions[item.value]);
      } else if (item.value in expr.unaryOps && expr.parser.isOperatorEnabled(item.value)) {
        nstack.push(expr.unaryOps[item.value]);
      } else {
        var v = values[item.value];
        if (v !== undefined) {
          nstack.push(v);
        } else {
          throw new Error('undefined variable: ' + item.value);
        }
      }
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = expr.unaryOps[item.value];
      nstack.push(f(resolveExpression(n1, values)));
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(resolveExpression(nstack.pop(), values));
      }
      f = nstack.pop();
      if (f.apply && f.call) {
        nstack.push(f.apply(undefined, args));
      } else {
        throw new Error(f + ' is not a function');
      }
    } else if (type === IFUNDEF) {
      // Create closure to keep references to arguments and expression
      nstack.push((function () {
        var n2 = nstack.pop();
        var args = [];
        var argCount = item.value;
        while (argCount-- > 0) {
          args.unshift(nstack.pop());
        }
        var n1 = nstack.pop();
        var f = function () {
          var scope = Object.assign({}, values);
          for (var i = 0, len = args.length; i < len; i++) {
            scope[args[i]] = arguments[i];
          }
          return evaluate(n2, expr, scope);
        };
        // f.name = n1
        Object.defineProperty(f, 'name', {
          value: n1,
          writable: false
        });
        values[n1] = f;
        return f;
      })());
    } else if (type === IEXPR) {
      nstack.push(createExpressionEvaluator(item, expr));
    } else if (type === IEXPREVAL) {
      nstack.push(item);
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1[item.value]);
    } else if (type === IENDSTATEMENT) {
      nstack.pop();
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push(args);
    } else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    throw new Error('invalid Expression (parity)');
  }
  // Explicitly return zero to avoid test issues caused by -0
  return nstack[0] === 0 ? 0 : resolveExpression(nstack[0], values);
}

function createExpressionEvaluator(token, expr, values) {
  if (isExpressionEvaluator(token)) return token;
  return {
    type: IEXPREVAL,
    value: function (scope) {
      return evaluate(token.value, expr, scope);
    }
  };
}

function isExpressionEvaluator(n) {
  return n && n.type === IEXPREVAL;
}

function resolveExpression(n, values) {
  return isExpressionEvaluator(n) ? n.value(values) : n;
}

function expressionToString(tokens, toJS) {
  var nstack = [];
  var n1, n2, n3;
  var f, args, argCount;
  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    var type = item.type;
    if (type === INUMBER) {
      if (typeof item.value === 'number' && item.value < 0) {
        nstack.push('(' + item.value + ')');
      } else if (Array.isArray(item.value)) {
        nstack.push('[' + item.value.map(escapeValue).join(', ') + ']');
      } else {
        nstack.push(escapeValue(item.value));
      }
    } else if (type === IOP2) {
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (toJS) {
        if (f === '^') {
          nstack.push('Math.pow(' + n1 + ', ' + n2 + ')');
        } else if (f === 'and') {
          nstack.push('(!!' + n1 + ' && !!' + n2 + ')');
        } else if (f === 'or') {
          nstack.push('(!!' + n1 + ' || !!' + n2 + ')');
        } else if (f === '||') {
          nstack.push('(function(a,b){ return Array.isArray(a) && Array.isArray(b) ? a.concat(b) : String(a) + String(b); }((' + n1 + '),(' + n2 + ')))');
        } else if (f === '==') {
          nstack.push('(' + n1 + ' === ' + n2 + ')');
        } else if (f === '!=') {
          nstack.push('(' + n1 + ' !== ' + n2 + ')');
        } else if (f === '[') {
          nstack.push(n1 + '[(' + n2 + ') | 0]');
        } else {
          nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
        }
      } else {
        if (f === '[') {
          nstack.push(n1 + '[' + n2 + ']');
        } else {
          nstack.push('(' + n1 + ' ' + f + ' ' + n2 + ')');
        }
      }
    } else if (type === IOP3) {
      n3 = nstack.pop();
      n2 = nstack.pop();
      n1 = nstack.pop();
      f = item.value;
      if (f === '?') {
        nstack.push('(' + n1 + ' ? ' + n2 + ' : ' + n3 + ')');
      } else {
        throw new Error('invalid Expression');
      }
    } else if (type === IVAR || type === IVARNAME) {
      nstack.push(item.value);
    } else if (type === IOP1) {
      n1 = nstack.pop();
      f = item.value;
      if (f === '-' || f === '+') {
        nstack.push('(' + f + n1 + ')');
      } else if (toJS) {
        if (f === 'not') {
          nstack.push('(' + '!' + n1 + ')');
        } else if (f === '!') {
          nstack.push('fac(' + n1 + ')');
        } else {
          nstack.push(f + '(' + n1 + ')');
        }
      } else if (f === '!') {
        nstack.push('(' + n1 + '!)');
      } else {
        nstack.push('(' + f + ' ' + n1 + ')');
      }
    } else if (type === IFUNCALL) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      f = nstack.pop();
      nstack.push(f + '(' + args.join(', ') + ')');
    } else if (type === IFUNDEF) {
      n2 = nstack.pop();
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      n1 = nstack.pop();
      if (toJS) {
        nstack.push('(' + n1 + ' = function(' + args.join(', ') + ') { return ' + n2 + ' })');
      } else {
        nstack.push('(' + n1 + '(' + args.join(', ') + ') = ' + n2 + ')');
      }
    } else if (type === IMEMBER) {
      n1 = nstack.pop();
      nstack.push(n1 + '.' + item.value);
    } else if (type === IARRAY) {
      argCount = item.value;
      args = [];
      while (argCount-- > 0) {
        args.unshift(nstack.pop());
      }
      nstack.push('[' + args.join(', ') + ']');
    } else if (type === IEXPR) {
      nstack.push('(' + expressionToString(item.value, toJS) + ')');
    } else if (type === IENDSTATEMENT) ; else {
      throw new Error('invalid Expression');
    }
  }
  if (nstack.length > 1) {
    if (toJS) {
      nstack = [ nstack.join(',') ];
    } else {
      nstack = [ nstack.join(';') ];
    }
  }
  return String(nstack[0]);
}

function escapeValue(v) {
  if (typeof v === 'string') {
    return JSON.stringify(v).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  }
  return v;
}

function contains(array, obj) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === obj) {
      return true;
    }
  }
  return false;
}

function getSymbols(tokens, symbols, options) {
  options = options || {};
  var withMembers = !!options.withMembers;
  var prevVar = null;

  for (var i = 0; i < tokens.length; i++) {
    var item = tokens[i];
    if (item.type === IVAR || item.type === IVARNAME) {
      if (!withMembers && !contains(symbols, item.value)) {
        symbols.push(item.value);
      } else if (prevVar !== null) {
        if (!contains(symbols, prevVar)) {
          symbols.push(prevVar);
        }
        prevVar = item.value;
      } else {
        prevVar = item.value;
      }
    } else if (item.type === IMEMBER && withMembers && prevVar !== null) {
      prevVar += '.' + item.value;
    } else if (item.type === IEXPR) {
      getSymbols(item.value, symbols, options);
    } else if (prevVar !== null) {
      if (!contains(symbols, prevVar)) {
        symbols.push(prevVar);
      }
      prevVar = null;
    }
  }

  if (prevVar !== null && !contains(symbols, prevVar)) {
    symbols.push(prevVar);
  }
}

function Expression(tokens, parser) {
  this.tokens = tokens;
  this.parser = parser;
  this.unaryOps = parser.unaryOps;
  this.binaryOps = parser.binaryOps;
  this.ternaryOps = parser.ternaryOps;
  this.functions = parser.functions;
}

Expression.prototype.simplify = function (values) {
  values = values || {};
  return new Expression(simplify(this.tokens, this.unaryOps, this.binaryOps, this.ternaryOps, values), this.parser);
};

Expression.prototype.substitute = function (variable, expr) {
  if (!(expr instanceof Expression)) {
    expr = this.parser.parse(String(expr));
  }

  return new Expression(substitute(this.tokens, variable, expr), this.parser);
};

Expression.prototype.evaluate = function (values) {
  values = values || {};
  return evaluate(this.tokens, this, values);
};

Expression.prototype.toString = function () {
  return expressionToString(this.tokens, false);
};

Expression.prototype.symbols = function (options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  return vars;
};

Expression.prototype.variables = function (options) {
  options = options || {};
  var vars = [];
  getSymbols(this.tokens, vars, options);
  var functions = this.functions;
  return vars.filter(function (name) {
    return !(name in functions);
  });
};

Expression.prototype.toJSFunction = function (param, variables) {
  var expr = this;
  var f = new Function(param, 'with(this.functions) with (this.ternaryOps) with (this.binaryOps) with (this.unaryOps) { return ' + expressionToString(this.simplify(variables).tokens, true) + '; }'); // eslint-disable-line no-new-func
  return function () {
    return f.apply(expr, arguments);
  };
};

var TEOF = 'TEOF';
var TOP = 'TOP';
var TNUMBER = 'TNUMBER';
var TSTRING = 'TSTRING';
var TPAREN = 'TPAREN';
var TBRACKET = 'TBRACKET';
var TCOMMA = 'TCOMMA';
var TNAME = 'TNAME';
var TSEMICOLON = 'TSEMICOLON';

function Token(type, value, index) {
  this.type = type;
  this.value = value;
  this.index = index;
}

Token.prototype.toString = function () {
  return this.type + ': ' + this.value;
};

function TokenStream(parser, expression) {
  this.pos = 0;
  this.current = null;
  this.unaryOps = parser.unaryOps;
  this.binaryOps = parser.binaryOps;
  this.ternaryOps = parser.ternaryOps;
  this.consts = parser.consts;
  this.expression = expression;
  this.savedPosition = 0;
  this.savedCurrent = null;
  this.options = parser.options;
  this.parser = parser;
}

TokenStream.prototype.newToken = function (type, value, pos) {
  return new Token(type, value, pos != null ? pos : this.pos);
};

TokenStream.prototype.save = function () {
  this.savedPosition = this.pos;
  this.savedCurrent = this.current;
};

TokenStream.prototype.restore = function () {
  this.pos = this.savedPosition;
  this.current = this.savedCurrent;
};

TokenStream.prototype.next = function () {
  if (this.pos >= this.expression.length) {
    return this.newToken(TEOF, 'EOF');
  }

  if (this.isWhitespace() || this.isComment()) {
    return this.next();
  } else if (this.isRadixInteger() ||
      this.isNumber() ||
      this.isOperator() ||
      this.isString() ||
      this.isParen() ||
      this.isBracket() ||
      this.isComma() ||
      this.isSemicolon() ||
      this.isNamedOp() ||
      this.isConst() ||
      this.isName()) {
    return this.current;
  } else {
    this.parseError('Unknown character "' + this.expression.charAt(this.pos) + '"');
  }
};

TokenStream.prototype.isString = function () {
  var r = false;
  var startPos = this.pos;
  var quote = this.expression.charAt(startPos);

  if (quote === '\'' || quote === '"') {
    var index = this.expression.indexOf(quote, startPos + 1);
    while (index >= 0 && this.pos < this.expression.length) {
      this.pos = index + 1;
      if (this.expression.charAt(index - 1) !== '\\') {
        var rawString = this.expression.substring(startPos + 1, index);
        this.current = this.newToken(TSTRING, this.unescape(rawString), startPos);
        r = true;
        break;
      }
      index = this.expression.indexOf(quote, index + 1);
    }
  }
  return r;
};

TokenStream.prototype.isParen = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '(' || c === ')') {
    this.current = this.newToken(TPAREN, c);
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isBracket = function () {
  var c = this.expression.charAt(this.pos);
  if ((c === '[' || c === ']') && this.isOperatorEnabled('[')) {
    this.current = this.newToken(TBRACKET, c);
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isComma = function () {
  var c = this.expression.charAt(this.pos);
  if (c === ',') {
    this.current = this.newToken(TCOMMA, ',');
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isSemicolon = function () {
  var c = this.expression.charAt(this.pos);
  if (c === ';') {
    this.current = this.newToken(TSEMICOLON, ';');
    this.pos++;
    return true;
  }
  return false;
};

TokenStream.prototype.isConst = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && c !== '.' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (str in this.consts) {
      this.current = this.newToken(TNUMBER, this.consts[str]);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isNamedOp = function () {
  var startPos = this.pos;
  var i = startPos;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    }
  }
  if (i > startPos) {
    var str = this.expression.substring(startPos, i);
    if (this.isOperatorEnabled(str) && (str in this.binaryOps || str in this.unaryOps || str in this.ternaryOps)) {
      this.current = this.newToken(TOP, str);
      this.pos += str.length;
      return true;
    }
  }
  return false;
};

TokenStream.prototype.isName = function () {
  var startPos = this.pos;
  var i = startPos;
  var hasLetter = false;
  for (; i < this.expression.length; i++) {
    var c = this.expression.charAt(i);
    if (c.toUpperCase() === c.toLowerCase()) {
      if (i === this.pos && (c === '$' || c === '_')) {
        if (c === '_') {
          hasLetter = true;
        }
        continue;
      } else if (i === this.pos || !hasLetter || (c !== '_' && (c < '0' || c > '9'))) {
        break;
      }
    } else {
      hasLetter = true;
    }
  }
  if (hasLetter) {
    var str = this.expression.substring(startPos, i);
    this.current = this.newToken(TNAME, str);
    this.pos += str.length;
    return true;
  }
  return false;
};

TokenStream.prototype.isWhitespace = function () {
  var r = false;
  var c = this.expression.charAt(this.pos);
  while (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
    r = true;
    this.pos++;
    if (this.pos >= this.expression.length) {
      break;
    }
    c = this.expression.charAt(this.pos);
  }
  return r;
};

var codePointPattern = /^[0-9a-f]{4}$/i;

TokenStream.prototype.unescape = function (v) {
  var index = v.indexOf('\\');
  if (index < 0) {
    return v;
  }

  var buffer = v.substring(0, index);
  while (index >= 0) {
    var c = v.charAt(++index);
    switch (c) {
      case '\'':
        buffer += '\'';
        break;
      case '"':
        buffer += '"';
        break;
      case '\\':
        buffer += '\\';
        break;
      case '/':
        buffer += '/';
        break;
      case 'b':
        buffer += '\b';
        break;
      case 'f':
        buffer += '\f';
        break;
      case 'n':
        buffer += '\n';
        break;
      case 'r':
        buffer += '\r';
        break;
      case 't':
        buffer += '\t';
        break;
      case 'u':
        // interpret the following 4 characters as the hex of the unicode code point
        var codePoint = v.substring(index + 1, index + 5);
        if (!codePointPattern.test(codePoint)) {
          this.parseError('Illegal escape sequence: \\u' + codePoint);
        }
        buffer += String.fromCharCode(parseInt(codePoint, 16));
        index += 4;
        break;
      default:
        throw this.parseError('Illegal escape sequence: "\\' + c + '"');
    }
    ++index;
    var backslash = v.indexOf('\\', index);
    buffer += v.substring(index, backslash < 0 ? v.length : backslash);
    index = backslash;
  }

  return buffer;
};

TokenStream.prototype.isComment = function () {
  var c = this.expression.charAt(this.pos);
  if (c === '/' && this.expression.charAt(this.pos + 1) === '*') {
    this.pos = this.expression.indexOf('*/', this.pos) + 2;
    if (this.pos === 1) {
      this.pos = this.expression.length;
    }
    return true;
  }
  return false;
};

TokenStream.prototype.isRadixInteger = function () {
  var pos = this.pos;

  if (pos >= this.expression.length - 2 || this.expression.charAt(pos) !== '0') {
    return false;
  }
  ++pos;

  var radix;
  var validDigit;
  if (this.expression.charAt(pos) === 'x') {
    radix = 16;
    validDigit = /^[0-9a-f]$/i;
    ++pos;
  } else if (this.expression.charAt(pos) === 'b') {
    radix = 2;
    validDigit = /^[01]$/i;
    ++pos;
  } else {
    return false;
  }

  var valid = false;
  var startPos = pos;

  while (pos < this.expression.length) {
    var c = this.expression.charAt(pos);
    if (validDigit.test(c)) {
      pos++;
      valid = true;
    } else {
      break;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseInt(this.expression.substring(startPos, pos), radix));
    this.pos = pos;
  }
  return valid;
};

TokenStream.prototype.isNumber = function () {
  var valid = false;
  var pos = this.pos;
  var startPos = pos;
  var resetPos = pos;
  var foundDot = false;
  var foundDigits = false;
  var c;

  while (pos < this.expression.length) {
    c = this.expression.charAt(pos);
    if ((c >= '0' && c <= '9') || (!foundDot && c === '.')) {
      if (c === '.') {
        foundDot = true;
      } else {
        foundDigits = true;
      }
      pos++;
      valid = foundDigits;
    } else {
      break;
    }
  }

  if (valid) {
    resetPos = pos;
  }

  if (c === 'e' || c === 'E') {
    pos++;
    var acceptSign = true;
    var validExponent = false;
    while (pos < this.expression.length) {
      c = this.expression.charAt(pos);
      if (acceptSign && (c === '+' || c === '-')) {
        acceptSign = false;
      } else if (c >= '0' && c <= '9') {
        validExponent = true;
        acceptSign = false;
      } else {
        break;
      }
      pos++;
    }

    if (!validExponent) {
      pos = resetPos;
    }
  }

  if (valid) {
    this.current = this.newToken(TNUMBER, parseFloat(this.expression.substring(startPos, pos)));
    this.pos = pos;
  } else {
    this.pos = resetPos;
  }
  return valid;
};

TokenStream.prototype.isOperator = function () {
  var startPos = this.pos;
  var c = this.expression.charAt(this.pos);

  if (c === '+' || c === '-' || c === '*' || c === '/' || c === '%' || c === '^' || c === '?' || c === ':' || c === '.') {
    this.current = this.newToken(TOP, c);
  } else if (c === '∙' || c === '•') {
    this.current = this.newToken(TOP, '*');
  } else if (c === '>') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '>=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '>');
    }
  } else if (c === '<') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '<=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, '<');
    }
  } else if (c === '|') {
    if (this.expression.charAt(this.pos + 1) === '|') {
      this.current = this.newToken(TOP, '||');
      this.pos++;
    } else {
      return false;
    }
  } else if (c === '=') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '==');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else if (c === '!') {
    if (this.expression.charAt(this.pos + 1) === '=') {
      this.current = this.newToken(TOP, '!=');
      this.pos++;
    } else {
      this.current = this.newToken(TOP, c);
    }
  } else {
    return false;
  }
  this.pos++;

  if (this.isOperatorEnabled(this.current.value)) {
    return true;
  } else {
    this.pos = startPos;
    return false;
  }
};

TokenStream.prototype.isOperatorEnabled = function (op) {
  return this.parser.isOperatorEnabled(op);
};

TokenStream.prototype.getCoordinates = function () {
  var line = 0;
  var column;
  var newline = -1;
  do {
    line++;
    column = this.pos - newline;
    newline = this.expression.indexOf('\n', newline + 1);
  } while (newline >= 0 && newline < this.pos);

  return {
    line: line,
    column: column
  };
};

TokenStream.prototype.parseError = function (msg) {
  var coords = this.getCoordinates();
  throw new Error('parse error [' + coords.line + ':' + coords.column + ']: ' + msg);
};

function ParserState(parser, tokenStream, options) {
  this.parser = parser;
  this.tokens = tokenStream;
  this.current = null;
  this.nextToken = null;
  this.next();
  this.savedCurrent = null;
  this.savedNextToken = null;
  this.allowMemberAccess = options.allowMemberAccess !== false;
}

ParserState.prototype.next = function () {
  this.current = this.nextToken;
  return (this.nextToken = this.tokens.next());
};

ParserState.prototype.tokenMatches = function (token, value) {
  if (typeof value === 'undefined') {
    return true;
  } else if (Array.isArray(value)) {
    return contains(value, token.value);
  } else if (typeof value === 'function') {
    return value(token);
  } else {
    return token.value === value;
  }
};

ParserState.prototype.save = function () {
  this.savedCurrent = this.current;
  this.savedNextToken = this.nextToken;
  this.tokens.save();
};

ParserState.prototype.restore = function () {
  this.tokens.restore();
  this.current = this.savedCurrent;
  this.nextToken = this.savedNextToken;
};

ParserState.prototype.accept = function (type, value) {
  if (this.nextToken.type === type && this.tokenMatches(this.nextToken, value)) {
    this.next();
    return true;
  }
  return false;
};

ParserState.prototype.expect = function (type, value) {
  if (!this.accept(type, value)) {
    var coords = this.tokens.getCoordinates();
    throw new Error('parse error [' + coords.line + ':' + coords.column + ']: Expected ' + (value || type));
  }
};

ParserState.prototype.parseAtom = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  if (this.accept(TNAME) || this.accept(TOP, isPrefixOperator)) {
    instr.push(new Instruction(IVAR, this.current.value));
  } else if (this.accept(TNUMBER)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TSTRING)) {
    instr.push(new Instruction(INUMBER, this.current.value));
  } else if (this.accept(TPAREN, '(')) {
    this.parseExpression(instr);
    this.expect(TPAREN, ')');
  } else if (this.accept(TBRACKET, '[')) {
    if (this.accept(TBRACKET, ']')) {
      instr.push(new Instruction(IARRAY, 0));
    } else {
      var argCount = this.parseArrayList(instr);
      instr.push(new Instruction(IARRAY, argCount));
    }
  } else {
    throw new Error('unexpected ' + this.nextToken);
  }
};

ParserState.prototype.parseExpression = function (instr) {
  var exprInstr = [];
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.parseVariableAssignmentExpression(exprInstr);
  if (this.parseUntilEndStatement(instr, exprInstr)) {
    return;
  }
  this.pushExpression(instr, exprInstr);
};

ParserState.prototype.pushExpression = function (instr, exprInstr) {
  for (var i = 0, len = exprInstr.length; i < len; i++) {
    instr.push(exprInstr[i]);
  }
};

ParserState.prototype.parseUntilEndStatement = function (instr, exprInstr) {
  if (!this.accept(TSEMICOLON)) return false;
  if (this.nextToken && this.nextToken.type !== TEOF && !(this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
    exprInstr.push(new Instruction(IENDSTATEMENT));
  }
  if (this.nextToken.type !== TEOF) {
    this.parseExpression(exprInstr);
  }
  instr.push(new Instruction(IEXPR, exprInstr));
  return true;
};

ParserState.prototype.parseArrayList = function (instr) {
  var argCount = 0;

  while (!this.accept(TBRACKET, ']')) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }

  return argCount;
};

ParserState.prototype.parseVariableAssignmentExpression = function (instr) {
  this.parseConditionalExpression(instr);
  while (this.accept(TOP, '=')) {
    var varName = instr.pop();
    var varValue = [];
    var lastInstrIndex = instr.length - 1;
    if (varName.type === IFUNCALL) {
      if (!this.tokens.isOperatorEnabled('()=')) {
        throw new Error('function definition is not permitted');
      }
      for (var i = 0, len = varName.value + 1; i < len; i++) {
        var index = lastInstrIndex - i;
        if (instr[index].type === IVAR) {
          instr[index] = new Instruction(IVARNAME, instr[index].value);
        }
      }
      this.parseVariableAssignmentExpression(varValue);
      instr.push(new Instruction(IEXPR, varValue));
      instr.push(new Instruction(IFUNDEF, varName.value));
      continue;
    }
    if (varName.type !== IVAR && varName.type !== IMEMBER) {
      throw new Error('expected variable for assignment');
    }
    this.parseVariableAssignmentExpression(varValue);
    instr.push(new Instruction(IVARNAME, varName.value));
    instr.push(new Instruction(IEXPR, varValue));
    instr.push(binaryInstruction('='));
  }
};

ParserState.prototype.parseConditionalExpression = function (instr) {
  this.parseOrExpression(instr);
  while (this.accept(TOP, '?')) {
    var trueBranch = [];
    var falseBranch = [];
    this.parseConditionalExpression(trueBranch);
    this.expect(TOP, ':');
    this.parseConditionalExpression(falseBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(ternaryInstruction('?'));
  }
};

ParserState.prototype.parseOrExpression = function (instr) {
  this.parseAndExpression(instr);
  while (this.accept(TOP, 'or')) {
    var falseBranch = [];
    this.parseAndExpression(falseBranch);
    instr.push(new Instruction(IEXPR, falseBranch));
    instr.push(binaryInstruction('or'));
  }
};

ParserState.prototype.parseAndExpression = function (instr) {
  this.parseComparison(instr);
  while (this.accept(TOP, 'and')) {
    var trueBranch = [];
    this.parseComparison(trueBranch);
    instr.push(new Instruction(IEXPR, trueBranch));
    instr.push(binaryInstruction('and'));
  }
};

var COMPARISON_OPERATORS = ['==', '!=', '<', '<=', '>=', '>', 'in'];

ParserState.prototype.parseComparison = function (instr) {
  this.parseAddSub(instr);
  while (this.accept(TOP, COMPARISON_OPERATORS)) {
    var op = this.current;
    this.parseAddSub(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var ADD_SUB_OPERATORS = ['+', '-', '||'];

ParserState.prototype.parseAddSub = function (instr) {
  this.parseTerm(instr);
  while (this.accept(TOP, ADD_SUB_OPERATORS)) {
    var op = this.current;
    this.parseTerm(instr);
    instr.push(binaryInstruction(op.value));
  }
};

var TERM_OPERATORS = ['*', '/', '%'];

ParserState.prototype.parseTerm = function (instr) {
  this.parseFactor(instr);
  while (this.accept(TOP, TERM_OPERATORS)) {
    var op = this.current;
    this.parseFactor(instr);
    instr.push(binaryInstruction(op.value));
  }
};

ParserState.prototype.parseFactor = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  this.save();
  if (this.accept(TOP, isPrefixOperator)) {
    if (this.current.value !== '-' && this.current.value !== '+') {
      if (this.nextToken.type === TPAREN && this.nextToken.value === '(') {
        this.restore();
        this.parseExponential(instr);
        return;
      } else if (this.nextToken.type === TSEMICOLON || this.nextToken.type === TCOMMA || this.nextToken.type === TEOF || (this.nextToken.type === TPAREN && this.nextToken.value === ')')) {
        this.restore();
        this.parseAtom(instr);
        return;
      }
    }

    var op = this.current;
    this.parseFactor(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseExponential(instr);
  }
};

ParserState.prototype.parseExponential = function (instr) {
  this.parsePostfixExpression(instr);
  while (this.accept(TOP, '^')) {
    this.parseFactor(instr);
    instr.push(binaryInstruction('^'));
  }
};

ParserState.prototype.parsePostfixExpression = function (instr) {
  this.parseFunctionCall(instr);
  while (this.accept(TOP, '!')) {
    instr.push(unaryInstruction('!'));
  }
};

ParserState.prototype.parseFunctionCall = function (instr) {
  var unaryOps = this.tokens.unaryOps;
  function isPrefixOperator(token) {
    return token.value in unaryOps;
  }

  if (this.accept(TOP, isPrefixOperator)) {
    var op = this.current;
    this.parseAtom(instr);
    instr.push(unaryInstruction(op.value));
  } else {
    this.parseMemberExpression(instr);
    while (this.accept(TPAREN, '(')) {
      if (this.accept(TPAREN, ')')) {
        instr.push(new Instruction(IFUNCALL, 0));
      } else {
        var argCount = this.parseArgumentList(instr);
        instr.push(new Instruction(IFUNCALL, argCount));
      }
    }
  }
};

ParserState.prototype.parseArgumentList = function (instr) {
  var argCount = 0;

  while (!this.accept(TPAREN, ')')) {
    this.parseExpression(instr);
    ++argCount;
    while (this.accept(TCOMMA)) {
      this.parseExpression(instr);
      ++argCount;
    }
  }

  return argCount;
};

ParserState.prototype.parseMemberExpression = function (instr) {
  this.parseAtom(instr);
  while (this.accept(TOP, '.') || this.accept(TBRACKET, '[')) {
    var op = this.current;

    if (op.value === '.') {
      if (!this.allowMemberAccess) {
        throw new Error('unexpected ".", member access is not permitted');
      }

      this.expect(TNAME);
      instr.push(new Instruction(IMEMBER, this.current.value));
    } else if (op.value === '[') {
      if (!this.tokens.isOperatorEnabled('[')) {
        throw new Error('unexpected "[]", arrays are disabled');
      }

      this.parseExpression(instr);
      this.expect(TBRACKET, ']');
      instr.push(binaryInstruction('['));
    } else {
      throw new Error('unexpected symbol: ' + op.value);
    }
  }
};

function add(a, b) {
  return Number(a) + Number(b);
}

function sub(a, b) {
  return a - b;
}

function mul(a, b) {
  return a * b;
}

function div(a, b) {
  return a / b;
}

function mod(a, b) {
  return a % b;
}

function concat(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.concat(b);
  }
  return '' + a + b;
}

function equal(a, b) {
  return a === b;
}

function notEqual(a, b) {
  return a !== b;
}

function greaterThan(a, b) {
  return a > b;
}

function lessThan(a, b) {
  return a < b;
}

function greaterThanEqual(a, b) {
  return a >= b;
}

function lessThanEqual(a, b) {
  return a <= b;
}

function andOperator(a, b) {
  return Boolean(a && b);
}

function orOperator(a, b) {
  return Boolean(a || b);
}

function inOperator(a, b) {
  return contains(b, a);
}

function sinh(a) {
  return ((Math.exp(a) - Math.exp(-a)) / 2);
}

function cosh(a) {
  return ((Math.exp(a) + Math.exp(-a)) / 2);
}

function tanh(a) {
  if (a === Infinity) return 1;
  if (a === -Infinity) return -1;
  return (Math.exp(a) - Math.exp(-a)) / (Math.exp(a) + Math.exp(-a));
}

function asinh(a) {
  if (a === -Infinity) return a;
  return Math.log(a + Math.sqrt((a * a) + 1));
}

function acosh(a) {
  return Math.log(a + Math.sqrt((a * a) - 1));
}

function atanh(a) {
  return (Math.log((1 + a) / (1 - a)) / 2);
}

function log10(a) {
  return Math.log(a) * Math.LOG10E;
}

function neg(a) {
  return -a;
}

function not(a) {
  return !a;
}

function trunc(a) {
  return a < 0 ? Math.ceil(a) : Math.floor(a);
}

function random(a) {
  return Math.random() * (a || 1);
}

function factorial(a) { // a!
  return gamma(a + 1);
}

function isInteger(value) {
  return isFinite(value) && (value === Math.round(value));
}

var GAMMA_G = 4.7421875;
var GAMMA_P = [
  0.99999999999999709182,
  57.156235665862923517, -59.597960355475491248,
  14.136097974741747174, -0.49191381609762019978,
  0.33994649984811888699e-4,
  0.46523628927048575665e-4, -0.98374475304879564677e-4,
  0.15808870322491248884e-3, -0.21026444172410488319e-3,
  0.21743961811521264320e-3, -0.16431810653676389022e-3,
  0.84418223983852743293e-4, -0.26190838401581408670e-4,
  0.36899182659531622704e-5
];

// Gamma function from math.js
function gamma(n) {
  var t, x;

  if (isInteger(n)) {
    if (n <= 0) {
      return isFinite(n) ? Infinity : NaN;
    }

    if (n > 171) {
      return Infinity; // Will overflow
    }

    var value = n - 2;
    var res = n - 1;
    while (value > 1) {
      res *= value;
      value--;
    }

    if (res === 0) {
      res = 1; // 0! is per definition 1
    }

    return res;
  }

  if (n < 0.5) {
    return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
  }

  if (n >= 171.35) {
    return Infinity; // will overflow
  }

  if (n > 85.0) { // Extended Stirling Approx
    var twoN = n * n;
    var threeN = twoN * n;
    var fourN = threeN * n;
    var fiveN = fourN * n;
    return Math.sqrt(2 * Math.PI / n) * Math.pow((n / Math.E), n) *
      (1 + (1 / (12 * n)) + (1 / (288 * twoN)) - (139 / (51840 * threeN)) -
      (571 / (2488320 * fourN)) + (163879 / (209018880 * fiveN)) +
      (5246819 / (75246796800 * fiveN * n)));
  }

  --n;
  x = GAMMA_P[0];
  for (var i = 1; i < GAMMA_P.length; ++i) {
    x += GAMMA_P[i] / (n + i);
  }

  t = n + GAMMA_G + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
}

function stringOrArrayLength(s) {
  if (Array.isArray(s)) {
    return s.length;
  }
  return String(s).length;
}

function hypot() {
  var sum = 0;
  var larg = 0;
  for (var i = 0; i < arguments.length; i++) {
    var arg = Math.abs(arguments[i]);
    var div;
    if (larg < arg) {
      div = larg / arg;
      sum = (sum * div * div) + 1;
      larg = arg;
    } else if (arg > 0) {
      div = arg / larg;
      sum += div * div;
    } else {
      sum += arg;
    }
  }
  return larg === Infinity ? Infinity : larg * Math.sqrt(sum);
}

function condition(cond, yep, nope) {
  return cond ? yep : nope;
}

/**
* Decimal adjustment of a number.
* From @escopecz.
*
* @param {Number} value The number.
* @param {Integer} exp  The exponent (the 10 logarithm of the adjustment base).
* @return {Number} The adjusted value.
*/
function roundTo(value, exp) {
  // If the exp is undefined or zero...
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math.round(value);
  }
  value = +value;
  exp = -(+exp);
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

function setVar(name, value, variables) {
  if (variables) variables[name] = value;
  return value;
}

function arrayIndex(array, index) {
  return array[index | 0];
}

function max(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.max.apply(Math, array);
  } else {
    return Math.max.apply(Math, arguments);
  }
}

function min(array) {
  if (arguments.length === 1 && Array.isArray(array)) {
    return Math.min.apply(Math, array);
  } else {
    return Math.min.apply(Math, arguments);
  }
}

function arrayMap(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to map is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to map is not an array');
  }
  return a.map(function (x, i) {
    return f(x, i);
  });
}

function arrayFold(f, init, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to fold is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to fold is not an array');
  }
  return a.reduce(function (acc, x, i) {
    return f(acc, x, i);
  }, init);
}

function arrayFilter(f, a) {
  if (typeof f !== 'function') {
    throw new Error('First argument to filter is not a function');
  }
  if (!Array.isArray(a)) {
    throw new Error('Second argument to filter is not an array');
  }
  return a.filter(function (x, i) {
    return f(x, i);
  });
}

function stringOrArrayIndexOf(target, s) {
  if (!(Array.isArray(s) || typeof s === 'string')) {
    throw new Error('Second argument to indexOf is not a string or array');
  }

  return s.indexOf(target);
}

function arrayJoin(sep, a) {
  if (!Array.isArray(a)) {
    throw new Error('Second argument to join is not an array');
  }

  return a.join(sep);
}

function sign(x) {
  return ((x > 0) - (x < 0)) || +x;
}

var ONE_THIRD = 1/3;
function cbrt(x) {
  return x < 0 ? -Math.pow(-x, ONE_THIRD) : Math.pow(x, ONE_THIRD);
}

function expm1(x) {
  return Math.exp(x) - 1;
}

function log1p(x) {
  return Math.log(1 + x);
}

function log2(x) {
  return Math.log(x) / Math.LN2;
}

function Parser(options) {
  this.options = options || {};
  this.unaryOps = {
    sin: Math.sin,
    cos: Math.cos,
    tan: Math.tan,
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    sinh: Math.sinh || sinh,
    cosh: Math.cosh || cosh,
    tanh: Math.tanh || tanh,
    asinh: Math.asinh || asinh,
    acosh: Math.acosh || acosh,
    atanh: Math.atanh || atanh,
    sqrt: Math.sqrt,
    cbrt: Math.cbrt || cbrt,
    log: Math.log,
    log2: Math.log2 || log2,
    ln: Math.log,
    lg: Math.log10 || log10,
    log10: Math.log10 || log10,
    expm1: Math.expm1 || expm1,
    log1p: Math.log1p || log1p,
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    trunc: Math.trunc || trunc,
    '-': neg,
    '+': Number,
    exp: Math.exp,
    not: not,
    length: stringOrArrayLength,
    '!': factorial,
    sign: Math.sign || sign
  };

  this.binaryOps = {
    '+': add,
    '-': sub,
    '*': mul,
    '/': div,
    '%': mod,
    '^': Math.pow,
    '||': concat,
    '==': equal,
    '!=': notEqual,
    '>': greaterThan,
    '<': lessThan,
    '>=': greaterThanEqual,
    '<=': lessThanEqual,
    and: andOperator,
    or: orOperator,
    'in': inOperator,
    '=': setVar,
    '[': arrayIndex
  };

  this.ternaryOps = {
    '?': condition
  };

  this.functions = {
    random: random,
    fac: factorial,
    min: min,
    max: max,
    hypot: Math.hypot || hypot,
    pyt: Math.hypot || hypot, // backward compat
    pow: Math.pow,
    atan2: Math.atan2,
    'if': condition,
    gamma: gamma,
    roundTo: roundTo,
    map: arrayMap,
    fold: arrayFold,
    filter: arrayFilter,
    indexOf: stringOrArrayIndexOf,
    join: arrayJoin
  };

  this.consts = {
    E: Math.E,
    PI: Math.PI,
    'true': true,
    'false': false
  };
}

Parser.prototype.parse = function (expr) {
  var instr = [];
  var parserState = new ParserState(
    this,
    new TokenStream(this, expr),
    { allowMemberAccess: this.options.allowMemberAccess }
  );

  parserState.parseExpression(instr);
  parserState.expect(TEOF, 'EOF');

  return new Expression(instr, this);
};

Parser.prototype.evaluate = function (expr, variables) {
  return this.parse(expr).evaluate(variables);
};

var sharedParser = new Parser();

Parser.parse = function (expr) {
  return sharedParser.parse(expr);
};

Parser.evaluate = function (expr, variables) {
  return sharedParser.parse(expr).evaluate(variables);
};

var optionNameMap = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  '/': 'divide',
  '%': 'remainder',
  '^': 'power',
  '!': 'factorial',
  '<': 'comparison',
  '>': 'comparison',
  '<=': 'comparison',
  '>=': 'comparison',
  '==': 'comparison',
  '!=': 'comparison',
  '||': 'concatenate',
  'and': 'logical',
  'or': 'logical',
  'not': 'logical',
  '?': 'conditional',
  ':': 'conditional',
  '=': 'assignment',
  '[': 'array',
  '()=': 'fndef'
};

function getOptionName(op) {
  return optionNameMap.hasOwnProperty(op) ? optionNameMap[op] : op;
}

Parser.prototype.isOperatorEnabled = function (op) {
  var optionName = getOptionName(op);
  var operators = this.options.operators || {};

  return !(optionName in operators) || !!operators[optionName];
};

/*!
 Based on ndef.parser, by Raphael Graf(r@undefined.ch)
 http://www.undefined.ch/mparser/index.html

 Ported to JavaScript and modified by Matthew Crumley (email@matthewcrumley.com, http://silentmatt.com/)

 You are free to use and modify this code in anyway you find useful. Please leave this comment in the code
 to acknowledge its original source. If you feel like it, I enjoy hearing about projects that use my code,
 but don't feel like you have to let me know or ask permission.
*/

// Backwards compatibility
var index = {
  Parser: Parser,
  Expression: Expression
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (index);



/***/ }),

/***/ "../../node_modules/just-extend/index.mjs":
/*!************************************************!*\
  !*** ../../node_modules/just-extend/index.mjs ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ objectExtend)
/* harmony export */ });
var objectExtend = extend;

/*
  var obj = {a: 3, b: 5};
  extend(obj, {a: 4, c: 8}); // {a: 4, b: 5, c: 8}
  obj; // {a: 4, b: 5, c: 8}

  var obj = {a: 3, b: 5};
  extend({}, obj, {a: 4, c: 8}); // {a: 4, b: 5, c: 8}
  obj; // {a: 3, b: 5}

  var arr = [1, 2, 3];
  var obj = {a: 3, b: 5};
  extend(obj, {c: arr}); // {a: 3, b: 5, c: [1, 2, 3]}
  arr.push(4);
  obj; // {a: 3, b: 5, c: [1, 2, 3, 4]}

  var arr = [1, 2, 3];
  var obj = {a: 3, b: 5};
  extend(true, obj, {c: arr}); // {a: 3, b: 5, c: [1, 2, 3]}
  arr.push(4);
  obj; // {a: 3, b: 5, c: [1, 2, 3]}

  extend({a: 4, b: 5}); // {a: 4, b: 5}
  extend({a: 4, b: 5}, 3); {a: 4, b: 5}
  extend({a: 4, b: 5}, true); {a: 4, b: 5}
  extend('hello', {a: 4, b: 5}); // throws
  extend(3, {a: 4, b: 5}); // throws
*/

function extend(/* [deep], obj1, obj2, [objn] */) {
  var args = [].slice.call(arguments);
  var deep = false;
  if (typeof args[0] == 'boolean') {
    deep = args.shift();
  }
  var result = args[0];
  if (isUnextendable(result)) {
    throw new Error('extendee must be an object');
  }
  var extenders = args.slice(1);
  var len = extenders.length;
  for (var i = 0; i < len; i++) {
    var extender = extenders[i];
    for (var key in extender) {
      if (Object.prototype.hasOwnProperty.call(extender, key)) {
        var value = extender[key];
        if (deep && isCloneable(value)) {
          var base = Array.isArray(value) ? [] : {};
          result[key] = extend(
            true,
            Object.prototype.hasOwnProperty.call(result, key) && !isUnextendable(result[key])
              ? result[key]
              : base,
            value
          );
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result;
}

function isCloneable(obj) {
  return Array.isArray(obj) || {}.toString.call(obj) == '[object Object]';
}

function isUnextendable(val) {
  return !val || (typeof val != 'object' && typeof val != 'function');
}




/***/ }),

/***/ "../../node_modules/colorjs.io/dist/color.js":
/*!***************************************************!*\
  !*** ../../node_modules/colorjs.io/dist/color.js ***!
  \***************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Color)
/* harmony export */ });
// A is m x n. B is n x p. product is m x p.
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _construct(Parent, args, Class) {
    if (_is_native_reflect_construct()) {
        _construct = Reflect.construct;
    } else {
        _construct = function construct(Parent, args, Class) {
            var a = [
                null
            ];
            a.push.apply(a, args);
            var Constructor = Function.bind.apply(Parent, a);
            var instance = new Constructor();
            if (Class) _set_prototype_of(instance, Class.prototype);
            return instance;
        };
    }
    return _construct.apply(null, arguments);
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _is_native_reflect_construct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;
    try {
        Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
        return true;
    } catch (e) {
        return false;
    }
}
function _create_super(Derived) {
    var hasNativeReflectConstruct = _is_native_reflect_construct();
    return function _createSuperInternal() {
        var Super = _get_prototype_of(Derived), result;
        if (hasNativeReflectConstruct) {
            var NewTarget = _get_prototype_of(this).constructor;
            result = Reflect.construct(Super, arguments, NewTarget);
        } else {
            result = Super.apply(this, arguments);
        }
        return _possible_constructor_return(this, result);
    };
}
function multiplyMatrices(A, B) {
    var m = A.length;
    if (!Array.isArray(A[0])) {
        // A is vector, convert to [[a, b, c, ...]]
        A = [
            A
        ];
    }
    if (!Array.isArray(B[0])) {
        // B is vector, convert to [[a], [b], [c], ...]]
        B = B.map(function(x) {
            return [
                x
            ];
        });
    }
    var p = B[0].length;
    var B_cols = B[0].map(function(_, i) {
        return B.map(function(x) {
            return x[i];
        });
    }); // transpose B
    var product = A.map(function(row) {
        return B_cols.map(function(col) {
            var ret = 0;
            if (!Array.isArray(row)) {
                var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                try {
                    for(var _iterator = col[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                        var c = _step.value;
                        ret += row * c;
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally{
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                        }
                    } finally{
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
                return ret;
            }
            for(var i = 0; i < row.length; i++){
                ret += row[i] * (col[i] || 0);
            }
            return ret;
        });
    });
    if (m === 1) {
        product = product[0]; // Avoid [[a, b, c, ...]]
    }
    if (p === 1) {
        return product.map(function(x) {
            return x[0];
        }); // Avoid [[a], [b], [c], ...]]
    }
    return product;
}
/**
 * Various utility functions
 */ /**
 * Check if a value is a string (including a String object)
 * @param {*} str - Value to check
 * @returns {boolean}
 */ function isString(str) {
    return type(str) === "string";
}
/**
 * Determine the internal JavaScript [[Class]] of an object.
 * @param {*} o - Value to check
 * @returns {string}
 */ function type(o) {
    var str = Object.prototype.toString.call(o);
    return (str.match(/^\[object\s+(.*?)\]$/)[1] || "").toLowerCase();
}
/**
 * Round a number to a certain number of significant digits
 * @param {number} n - The number to round
 * @param {number} precision - Number of significant digits
 */ function toPrecision(n, precision) {
    n = +n;
    precision = +precision;
    var integerLength = (Math.floor(n) + "").length;
    if (precision > integerLength) {
        return +n.toFixed(precision - integerLength);
    } else {
        var p10 = Math.pow(10, integerLength - precision);
        return Math.round(n / p10) * p10;
    }
}
/**
* Parse a CSS function, regardless of its name and arguments
* @param String str String to parse
* @return {{name, args, rawArgs}}
*/ function parseFunction(str) {
    if (!str) {
        return;
    }
    str = str.trim();
    var isFunctionRegex = /^([a-z]+)\((.+?)\)$/i;
    var isNumberRegex = /^-?[\d.]+$/;
    var parts = str.match(isFunctionRegex);
    if (parts) {
        // It is a function, parse args
        var args = [];
        parts[2].replace(/\/?\s*([-\w.]+(?:%|deg)?)/g, function($0, arg) {
            if (/%$/.test(arg)) {
                // Convert percentages to 0-1 numbers
                arg = new Number(arg.slice(0, -1) / 100);
                arg.type = "<percentage>";
            } else if (/deg$/.test(arg)) {
                // Drop deg from degrees and convert to number
                // TODO handle other units too
                arg = new Number(+arg.slice(0, -3));
                arg.type = "<angle>";
                arg.unit = "deg";
            } else if (isNumberRegex.test(arg)) {
                // Convert numerical args to numbers
                arg = new Number(arg);
                arg.type = "<number>";
            }
            if ($0.startsWith("/")) {
                // It's alpha
                arg = _instanceof(arg, Number) ? arg : new Number(arg);
                arg.alpha = true;
            }
            args.push(arg);
        });
        return {
            name: parts[1].toLowerCase(),
            rawName: parts[1],
            rawArgs: parts[2],
            // An argument could be (as of css-color-4):
            // a number, percentage, degrees (hue), ident (in color())
            args: args
        };
    }
}
function last(arr) {
    return arr[arr.length - 1];
}
function interpolate(start, end, p) {
    if (isNaN(start)) {
        return end;
    }
    if (isNaN(end)) {
        return start;
    }
    return start + (end - start) * p;
}
function interpolateInv(start, end, value) {
    return (value - start) / (end - start);
}
function mapRange(from, to, value) {
    return interpolate(to[0], to[1], interpolateInv(from[0], from[1], value));
}
function parseCoordGrammar(coordGrammars) {
    return coordGrammars.map(function(coordGrammar) {
        return coordGrammar.split("|").map(function(type) {
            type = type.trim();
            var _$range = type.match(/^(<[a-z]+>)\[(-?[.\d]+),\s*(-?[.\d]+)\]?$/);
            if (_$range) {
                var ret = new String(_$range[1]);
                ret.range = [
                    +_$range[2],
                    +_$range[3]
                ];
                return ret;
            }
            return type;
        });
    });
}
var util = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    interpolate: interpolate,
    interpolateInv: interpolateInv,
    isString: isString,
    last: last,
    mapRange: mapRange,
    multiplyMatrices: multiplyMatrices,
    parseCoordGrammar: parseCoordGrammar,
    parseFunction: parseFunction,
    toPrecision: toPrecision,
    type: type
});
/**
 * A class for adding deep extensibility to any piece of JS code
 */ var Hooks = /*#__PURE__*/ function() {
    "use strict";
    function Hooks() {
        _class_call_check(this, Hooks);
    }
    _create_class(Hooks, [
        {
            key: "add",
            value: function add(name, callback, first) {
                if (typeof arguments[0] != "string") {
                    // Multiple hooks
                    for(var name in arguments[0]){
                        this.add(name, arguments[0][name], arguments[1]);
                    }
                    return;
                }
                (Array.isArray(name) ? name : [
                    name
                ]).forEach(function(name) {
                    this[name] = this[name] || [];
                    if (callback) {
                        this[name][first ? "unshift" : "push"](callback);
                    }
                }, this);
            }
        },
        {
            key: "run",
            value: function run(name, env) {
                this[name] = this[name] || [];
                this[name].forEach(function(callback) {
                    callback.call(env && env.context ? env.context : env, env);
                });
            }
        }
    ]);
    return Hooks;
}();
/**
 * The instance of {@link Hooks} used throughout Color.js
 */ var hooks = new Hooks();
// Global defaults one may want to configure
var defaults = {
    gamut_mapping: "lch.c",
    precision: 5,
    deltaE: "76"
};
var WHITES = {
    // for compatibility, the four-digit chromaticity-derived ones everyone else uses
    D50: [
        0.3457 / 0.3585,
        1.00000,
        (1.0 - 0.3457 - 0.3585) / 0.3585
    ],
    D65: [
        0.3127 / 0.3290,
        1.00000,
        (1.0 - 0.3127 - 0.3290) / 0.3290
    ]
};
function getWhite(name) {
    if (Array.isArray(name)) {
        return name;
    }
    return WHITES[name];
}
// Adapt XYZ from white point W1 to W2
function adapt$1(W1, W2, XYZ) {
    var options = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    W1 = getWhite(W1);
    W2 = getWhite(W2);
    if (!W1 || !W2) {
        throw new TypeError("Missing white point to convert ".concat(!W1 ? "from" : "").concat(!W1 && !W2 ? "/" : "").concat(!W2 ? "to" : ""));
    }
    if (W1 === W2) {
        // Same whitepoints, no conversion needed
        return XYZ;
    }
    var env = {
        W1: W1,
        W2: W2,
        XYZ: XYZ,
        options: options
    };
    hooks.run("chromatic-adaptation-start", env);
    if (!env.M) {
        if (env.W1 === WHITES.D65 && env.W2 === WHITES.D50) {
            env.M = [
                [
                    1.0479298208405488,
                    0.022946793341019088,
                    -0.05019222954313557
                ],
                [
                    0.029627815688159344,
                    0.990434484573249,
                    -0.01707382502938514
                ],
                [
                    -0.009243058152591178,
                    0.015055144896577895,
                    0.7518742899580008
                ]
            ];
        } else if (env.W1 === WHITES.D50 && env.W2 === WHITES.D65) {
            env.M = [
                [
                    0.9554734527042182,
                    -0.023098536874261423,
                    0.0632593086610217
                ],
                [
                    -0.028369706963208136,
                    1.0099954580058226,
                    0.021041398966943008
                ],
                [
                    0.012314001688319899,
                    -0.020507696433477912,
                    1.3303659366080753
                ]
            ];
        }
    }
    hooks.run("chromatic-adaptation-end", env);
    if (env.M) {
        return multiplyMatrices(env.M, env.XYZ);
    } else {
        throw new TypeError("Only Bradford CAT with white points D50 and D65 supported for now.");
    }
}
var ε$4 = .000075;
/**
 * Class to represent a color space
 */ var ColorSpace = /*#__PURE__*/ function() {
    "use strict";
    function ColorSpace(options) {
        _class_call_check(this, ColorSpace);
        var _this_formats_functions, _this_formats, _this_formats1;
        this.id = options.id;
        this.name = options.name;
        this.base = options.base ? ColorSpace.get(options.base) : null;
        this.aliases = options.aliases;
        if (this.base) {
            this.fromBase = options.fromBase;
            this.toBase = options.toBase;
        }
        var _options_coords;
        // Coordinate metadata
        var coords = (_options_coords = options.coords) !== null && _options_coords !== void 0 ? _options_coords : this.base.coords;
        for(var name in coords){
            if (!("name" in coords[name])) {
                coords[name].name = name;
            }
        }
        this.coords = coords;
        var _options_white, _ref;
        // White point
        var white = (_ref = (_options_white = options.white) !== null && _options_white !== void 0 ? _options_white : this.base.white) !== null && _ref !== void 0 ? _ref : "D65";
        this.white = getWhite(white);
        var _options_formats;
        // Sort out formats
        this.formats = (_options_formats = options.formats) !== null && _options_formats !== void 0 ? _options_formats : {};
        for(var name1 in this.formats){
            var _format, _format1;
            var format = this.formats[name1];
            (_format = format).type || (_format.type = "function");
            (_format1 = format).name || (_format1.name = name1);
        }
        if (options.cssId && !((_this_formats_functions = this.formats.functions) === null || _this_formats_functions === void 0 ? void 0 : _this_formats_functions.color)) {
            this.formats.color = {
                id: options.cssId
            };
            Object.defineProperty(this, "cssId", {
                value: options.cssId
            });
        } else if (((_this_formats = this.formats) === null || _this_formats === void 0 ? void 0 : _this_formats.color) && !((_this_formats1 = this.formats) === null || _this_formats1 === void 0 ? void 0 : _this_formats1.color.id)) {
            this.formats.color.id = this.id;
        }
        // Other stuff
        this.referred = options.referred;
        // Compute ancestors and store them, since they will never change
        Object.defineProperty(this, "path", {
            value: getPath(this).reverse(),
            writable: false,
            enumerable: true,
            configurable: true
        });
        hooks.run("colorspace-init-end", this);
    }
    _create_class(ColorSpace, [
        {
            key: "inGamut",
            value: function inGamut(coords) {
                var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref_epsilon = _ref.epsilon, epsilon = _ref_epsilon === void 0 ? ε$4 : _ref_epsilon;
                if (this.isPolar) {
                    // Do not check gamut through polar coordinates
                    coords = this.toBase(coords);
                    return this.base.inGamut(coords, {
                        epsilon: epsilon
                    });
                }
                var coordMeta = Object.values(this.coords);
                return coords.every(function(c, i) {
                    var meta = coordMeta[i];
                    if (meta.type !== "angle" && meta.range) {
                        if (Number.isNaN(c)) {
                            // NaN is always in gamut
                            return true;
                        }
                        var _meta_range = _sliced_to_array(meta.range, 2), min = _meta_range[0], max = _meta_range[1];
                        return (min === undefined || c >= min - epsilon) && (max === undefined || c <= max + epsilon);
                    }
                    return true;
                });
            }
        },
        {
            key: "cssId",
            get: function get() {
                var _this_formats_functions_color, _this_formats_functions;
                return ((_this_formats_functions = this.formats.functions) === null || _this_formats_functions === void 0 ? void 0 : (_this_formats_functions_color = _this_formats_functions.color) === null || _this_formats_functions_color === void 0 ? void 0 : _this_formats_functions_color.id) || this.id;
            }
        },
        {
            key: "isPolar",
            get: function get() {
                for(var id in this.coords){
                    if (this.coords[id].type === "angle") {
                        return true;
                    }
                }
                return false;
            }
        },
        {
            key: "getFormat",
            value: function getFormat(format) {
                if (typeof format === "object") {
                    format = processFormat(format, this);
                    return format;
                }
                var ret;
                if (format === "default") {
                    // Get first format
                    ret = Object.values(this.formats)[0];
                } else {
                    ret = this.formats[format];
                }
                if (ret) {
                    ret = processFormat(ret, this);
                    return ret;
                }
                return null;
            }
        },
        {
            // We cannot rely on simple === because then ColorSpace objects cannot be proxied
            key: "equals",
            value: function equals(space) {
                if (!space) {
                    return false;
                }
                return this === space || this.id === space.id;
            }
        },
        {
            key: "to",
            value: function to(space, coords) {
                if (arguments.length === 1) {
                    var ref;
                    ref = [
                        space.space,
                        space.coords
                    ], space = ref[0], coords = ref[1], ref;
                }
                space = ColorSpace.get(space);
                if (this.equals(space)) {
                    // Same space, no change needed
                    return coords;
                }
                // Convert NaN to 0, which seems to be valid in every coordinate of every color space
                coords = coords.map(function(c) {
                    return Number.isNaN(c) ? 0 : c;
                });
                // Find connection space = lowest common ancestor in the base tree
                var myPath = this.path;
                var otherPath = space.path;
                var connectionSpace, connectionSpaceIndex;
                for(var i = 0; i < myPath.length; i++){
                    if (myPath[i].equals(otherPath[i])) {
                        connectionSpace = myPath[i];
                        connectionSpaceIndex = i;
                    } else {
                        break;
                    }
                }
                if (!connectionSpace) {
                    // This should never happen
                    throw new Error("Cannot convert between color spaces ".concat(this, " and ").concat(space, ": no connection space was found"));
                }
                // Go up from current space to connection space
                for(var i1 = myPath.length - 1; i1 > connectionSpaceIndex; i1--){
                    coords = myPath[i1].toBase(coords);
                }
                // Go down from connection space to target space
                for(var i2 = connectionSpaceIndex + 1; i2 < otherPath.length; i2++){
                    coords = otherPath[i2].fromBase(coords);
                }
                return coords;
            }
        },
        {
            key: "from",
            value: function from(space, coords) {
                if (arguments.length === 1) {
                    var ref;
                    ref = [
                        space.space,
                        space.coords
                    ], space = ref[0], coords = ref[1], ref;
                }
                space = ColorSpace.get(space);
                return space.to(this, coords);
            }
        },
        {
            key: "toString",
            value: function toString() {
                return "".concat(this.name, " (").concat(this.id, ")");
            }
        },
        {
            key: "getMinCoords",
            value: function getMinCoords() {
                var ret = [];
                for(var id in this.coords){
                    var meta = this.coords[id];
                    var _$range = meta.range || meta.refRange;
                    var _range_min;
                    ret.push((_range_min = _$range === null || _$range === void 0 ? void 0 : _$range.min) !== null && _range_min !== void 0 ? _range_min : 0);
                }
                return ret;
            }
        }
    ], [
        {
            key: "all",
            get: // Returns array of unique color spaces
            function get() {
                return _to_consumable_array(new Set(Object.values(ColorSpace.registry)));
            }
        },
        {
            key: "register",
            value: function register(id, space) {
                if (arguments.length === 1) {
                    space = arguments[0];
                    id = space.id;
                }
                space = this.get(space);
                if (this.registry[id] && this.registry[id] !== space) {
                    throw new Error("Duplicate color space registration: '".concat(id, "'"));
                }
                this.registry[id] = space;
                // Register aliases when called without an explicit ID.
                if (arguments.length === 1 && space.aliases) {
                    var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
                    try {
                        for(var _iterator = space.aliases[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                            var alias = _step.value;
                            this.register(alias, space);
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally{
                        try {
                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                                _iterator.return();
                            }
                        } finally{
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }
                return space;
            }
        },
        {
            key: "get",
            value: /**
	 * Lookup ColorSpace object by name
	 * @param {ColorSpace | string} name
	 */ function get(space) {
                for(var _len = arguments.length, alternatives = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                    alternatives[_key - 1] = arguments[_key];
                }
                if (!space || _instanceof(space, ColorSpace)) {
                    return space;
                }
                var argType = type(space);
                if (argType === "string") {
                    // It's a color space id
                    var ret = ColorSpace.registry[space.toLowerCase()];
                    if (!ret) {
                        throw new TypeError('No color space found with id = "'.concat(space, '"'));
                    }
                    return ret;
                }
                if (alternatives.length) {
                    var _ColorSpace;
                    return (_ColorSpace = ColorSpace).get.apply(_ColorSpace, _to_consumable_array(alternatives));
                }
                throw new TypeError("".concat(space, " is not a valid color space"));
            }
        },
        {
            key: "resolveCoord",
            value: /**
	 * Get metadata about a coordinate of a color space
	 *
	 * @static
	 * @param {Array | string} ref
	 * @param {ColorSpace | string} [workingSpace]
	 * @return {Object}
	 */ function resolveCoord(ref, workingSpace) {
                var coordType = type(ref);
                var space, coord;
                if (coordType === "string") {
                    if (ref.includes(".")) {
                        var _$ref;
                        // Absolute coordinate
                        _$ref = _sliced_to_array(ref.split("."), 2), space = _$ref[0], coord = _$ref[1], _$ref;
                    } else {
                        var _$ref1;
                        // Relative coordinate
                        _$ref1 = [
                            ,
                            ref
                        ], space = _$ref1[0], coord = _$ref1[1], _$ref1;
                    }
                } else if (Array.isArray(ref)) {
                    var _$ref2;
                    _$ref2 = _sliced_to_array(ref, 2), space = _$ref2[0], coord = _$ref2[1], _$ref2;
                } else {
                    // Object
                    space = ref.space;
                    coord = ref.coordId;
                }
                space = ColorSpace.get(space);
                if (!space) {
                    space = workingSpace;
                }
                if (!space) {
                    throw new TypeError("Cannot resolve coordinate reference ".concat(ref, ": No color space specified and relative references are not allowed here"));
                }
                coordType = type(coord);
                if (coordType === "number" || coordType === "string" && coord >= 0) {
                    // Resolve numerical coord
                    var meta = Object.entries(space.coords)[coord];
                    if (meta) {
                        return _object_spread({
                            space: space,
                            id: meta[0],
                            index: coord
                        }, meta[1]);
                    }
                }
                space = ColorSpace.get(space);
                var normalizedCoord = coord.toLowerCase();
                var i = 0;
                for(var id in space.coords){
                    var _meta_name;
                    var meta1 = space.coords[id];
                    if (id.toLowerCase() === normalizedCoord || ((_meta_name = meta1.name) === null || _meta_name === void 0 ? void 0 : _meta_name.toLowerCase()) === normalizedCoord) {
                        return _object_spread({
                            space: space,
                            id: id,
                            index: i
                        }, meta1);
                    }
                    i++;
                }
                throw new TypeError('No "'.concat(coord, '" coordinate found in ').concat(space.name, ". Its coordinates are: ").concat(Object.keys(space.coords).join(", ")));
            }
        }
    ]);
    return ColorSpace;
}();
_define_property(ColorSpace, "registry", {});
_define_property(ColorSpace, "DEFAULT_FORMAT", {
    type: "functions",
    name: "color"
});
function getPath(space) {
    var ret = [
        space
    ];
    for(var s = space; s = s.base;){
        ret.push(s);
    }
    return ret;
}
function processFormat(format) {
    var coords = (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}).coords;
    if (format.coords && !format.coordGrammar) {
        var _format, _format1;
        (_format = format).type || (_format.type = "function");
        (_format1 = format).name || (_format1.name = "color");
        // Format has not been processed
        format.coordGrammar = parseCoordGrammar(format.coords);
        var coordFormats = Object.entries(coords).map(function(param, i) {
            var _param = _sliced_to_array(param, 2), id = _param[0], coordMeta = _param[1];
            // Preferred format for each coord is the first one
            var outputType = format.coordGrammar[i][0];
            var fromRange = coordMeta.range || coordMeta.refRange;
            var toRange = outputType.range, suffix = "";
            // Non-strict equals intentional since outputType could be a string object
            if (outputType == "<percentage>") {
                toRange = [
                    0,
                    100
                ];
                suffix = "%";
            } else if (outputType == "<angle>") {
                suffix = "deg";
            }
            return {
                fromRange: fromRange,
                toRange: toRange,
                suffix: suffix
            };
        });
        format.serializeCoords = function(coords, precision) {
            return coords.map(function(c, i) {
                var _coordFormats_i = coordFormats[i], fromRange = _coordFormats_i.fromRange, toRange = _coordFormats_i.toRange, suffix = _coordFormats_i.suffix;
                if (fromRange && toRange) {
                    c = mapRange(fromRange, toRange, c);
                }
                c = toPrecision(c, precision);
                if (suffix) {
                    c += suffix;
                }
                return c;
            });
        };
    }
    return format;
}
var XYZ_D65 = new ColorSpace({
    id: "xyz-d65",
    name: "XYZ D65",
    coords: {
        x: {
            name: "X"
        },
        y: {
            name: "Y"
        },
        z: {
            name: "Z"
        }
    },
    white: "D65",
    formats: {
        color: {
            ids: [
                "xyz-d65",
                "xyz"
            ]
        }
    },
    aliases: [
        "xyz"
    ]
});
/**
 * Convenience class for RGB color spaces
 * @extends {ColorSpace}
 */ var RGBColorSpace = /*#__PURE__*/ function(ColorSpace) {
    "use strict";
    _inherits(RGBColorSpace, ColorSpace);
    var _super = _create_super(RGBColorSpace);
    function RGBColorSpace(options) {
        _class_call_check(this, RGBColorSpace);
        var _this;
        var _options;
        if (!options.coords) {
            options.coords = {
                r: {
                    range: [
                        0,
                        1
                    ],
                    name: "Red"
                },
                g: {
                    range: [
                        0,
                        1
                    ],
                    name: "Green"
                },
                b: {
                    range: [
                        0,
                        1
                    ],
                    name: "Blue"
                }
            };
        }
        if (!options.base) {
            options.base = XYZ_D65;
        }
        if (options.toXYZ_M && options.fromXYZ_M) {
            var _options1, _options2;
            var _toBase;
            (_toBase = (_options1 = options).toBase) !== null && _toBase !== void 0 ? _toBase : _options1.toBase = function(rgb) {
                var xyz = multiplyMatrices(options.toXYZ_M, rgb);
                if (_this.white !== _this.base.white) {
                    // Perform chromatic adaptation
                    xyz = adapt$1(_this.white, _this.base.white, xyz);
                }
                return xyz;
            };
            var _fromBase;
            (_fromBase = (_options2 = options).fromBase) !== null && _fromBase !== void 0 ? _fromBase : _options2.fromBase = function(xyz) {
                xyz = adapt$1(_this.base.white, _this.white, xyz);
                return multiplyMatrices(options.fromXYZ_M, xyz);
            };
        }
        var _referred;
        (_referred = (_options = options).referred) !== null && _referred !== void 0 ? _referred : _options.referred = "display";
        _this = _super.call(this, options);
        return _this;
    }
    return RGBColorSpace;
}(ColorSpace);
/**
 * Convert a CSS Color string to a color object
 * @param {string} str
 * @param {object} [options]
 * @param {object} [options.meta] - Object for additional information about the parsing
 * @returns { Color }
 */ function parse(str) {
    var meta = (arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}).meta;
    var _String;
    var env = {
        "str": (_String = String(str)) === null || _String === void 0 ? void 0 : _String.trim()
    };
    hooks.run("parse-start", env);
    if (env.color) {
        return env.color;
    }
    env.parsed = parseFunction(env.str);
    if (env.parsed) {
        // Is a functional syntax
        var name = env.parsed.name;
        if (name === "color") {
            // color() function
            var id = env.parsed.args.shift();
            var alpha = env.parsed.rawArgs.indexOf("/") > 0 ? env.parsed.args.pop() : 1;
            var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
            try {
                for(var _iterator = ColorSpace.all[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
                    var space = _step.value;
                    var colorSpec = space.getFormat("color");
                    if (colorSpec) {
                        var _colorSpec_ids;
                        if (id === colorSpec.id || ((_colorSpec_ids = colorSpec.ids) === null || _colorSpec_ids === void 0 ? void 0 : _colorSpec_ids.includes(id))) {
                            // From https://drafts.csswg.org/css-color-4/#color-function
                            // If more <number>s or <percentage>s are provided than parameters that the colorspace takes, the excess <number>s at the end are ignored.
                            // If less <number>s or <percentage>s are provided than parameters that the colorspace takes, the missing parameters default to 0. (This is particularly convenient for multichannel printers where the additional inks are spot colors or varnishes that most colors on the page won’t use.)
                            var coords = Object.keys(space.coords).map(function(_, i) {
                                return env.parsed.args[i] || 0;
                            });
                            if (meta) {
                                meta.formatId = "color";
                            }
                            return {
                                spaceId: space.id,
                                coords: coords,
                                alpha: alpha
                            };
                        }
                    }
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                    }
                } finally{
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
            // Not found
            var didYouMean = "";
            if (id in ColorSpace.registry) {
                var _ColorSpace_registry_id_formats_functions_color, _ColorSpace_registry_id_formats_functions, _ColorSpace_registry_id_formats;
                // Used color space id instead of color() id, these are often different
                var cssId = (_ColorSpace_registry_id_formats = ColorSpace.registry[id].formats) === null || _ColorSpace_registry_id_formats === void 0 ? void 0 : (_ColorSpace_registry_id_formats_functions = _ColorSpace_registry_id_formats.functions) === null || _ColorSpace_registry_id_formats_functions === void 0 ? void 0 : (_ColorSpace_registry_id_formats_functions_color = _ColorSpace_registry_id_formats_functions.color) === null || _ColorSpace_registry_id_formats_functions_color === void 0 ? void 0 : _ColorSpace_registry_id_formats_functions_color.id;
                if (cssId) {
                    didYouMean = "Did you mean color(".concat(cssId, ")?");
                }
            }
            throw new TypeError("Cannot parse color(".concat(id, "). ") + (didYouMean || "Missing a plugin?"));
        } else {
            var _iteratorNormalCompletion1 = true, _didIteratorError1 = false, _iteratorError1 = undefined;
            try {
                var _loop = function() {
                    var space = _step1.value;
                    // color space specific function
                    var format = space.getFormat(name);
                    if (format && format.type === "function") {
                        var alpha = 1;
                        if (format.lastAlpha || last(env.parsed.args).alpha) {
                            alpha = env.parsed.args.pop();
                        }
                        var coords = env.parsed.args;
                        var types = void 0;
                        if (format.coordGrammar) {
                            types = Object.entries(space.coords).map(function(param, i) {
                                var _param = _sliced_to_array(param, 2), id = _param[0], coordMeta = _param[1];
                                var _coords_i;
                                var coordGrammar = format.coordGrammar[i];
                                var providedType = (_coords_i = coords[i]) === null || _coords_i === void 0 ? void 0 : _coords_i.type;
                                // Find grammar alternative that matches the provided type
                                // Non-strict equals is intentional because we are comparing w/ string objects
                                var _$type = coordGrammar.find(function(c) {
                                    return c == providedType;
                                });
                                // Check that each coord conforms to its grammar
                                if (!_$type) {
                                    // Type does not exist in the grammar, throw
                                    var coordName = coordMeta.name || id;
                                    throw new TypeError("".concat(providedType, " not allowed for ").concat(coordName, " in ").concat(name, "()"));
                                }
                                var fromRange = _$type.range;
                                if (providedType === "<percentage>") {
                                    fromRange || (fromRange = [
                                        0,
                                        1
                                    ]);
                                }
                                var toRange = coordMeta.range || coordMeta.refRange;
                                if (fromRange && toRange) {
                                    coords[i] = mapRange(fromRange, toRange, coords[i]);
                                }
                                return _$type;
                            });
                        }
                        if (meta) {
                            Object.assign(meta, {
                                formatId: format.name,
                                types: types
                            });
                        }
                        return {
                            v: {
                                spaceId: space.id,
                                coords: coords,
                                alpha: alpha
                            }
                        };
                    }
                };
                for(var _iterator1 = ColorSpace.all[Symbol.iterator](), _step1; !(_iteratorNormalCompletion1 = (_step1 = _iterator1.next()).done); _iteratorNormalCompletion1 = true){
                    var _ret = _loop();
                    if (_type_of(_ret) === "object") return _ret.v;
                }
            } catch (err) {
                _didIteratorError1 = true;
                _iteratorError1 = err;
            } finally{
                try {
                    if (!_iteratorNormalCompletion1 && _iterator1.return != null) {
                        _iterator1.return();
                    }
                } finally{
                    if (_didIteratorError1) {
                        throw _iteratorError1;
                    }
                }
            }
        }
    } else {
        var _iteratorNormalCompletion2 = true, _didIteratorError2 = false, _iteratorError2 = undefined;
        try {
            // Custom, colorspace-specific format
            for(var _iterator2 = ColorSpace.all[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true){
                var space1 = _step2.value;
                for(var formatId in space1.formats){
                    var format = space1.formats[formatId];
                    if (format.type !== "custom") {
                        continue;
                    }
                    if (format.test && !format.test(env.str)) {
                        continue;
                    }
                    var color = format.parse(env.str);
                    if (color) {
                        var _color;
                        var _alpha;
                        (_alpha = (_color = color).alpha) !== null && _alpha !== void 0 ? _alpha : _color.alpha = 1;
                        if (meta) {
                            meta.formatId = formatId;
                        }
                        return color;
                    }
                }
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                    _iterator2.return();
                }
            } finally{
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }
    }
    // If we're here, we couldn't parse
    throw new TypeError("Could not parse ".concat(str, " as a color. Missing a plugin?"));
}
/**
 * Resolves a color reference (object or string) to a plain color object
 * @param {Color | {space, coords, alpha} | string} color
 * @returns {{space, coords, alpha}}
 */ function getColor(color) {
    if (!color) {
        throw new TypeError("Empty color reference");
    }
    if (isString(color)) {
        color = parse(color);
    }
    // Object fixup
    var space = color.space || color.spaceId;
    if (!_instanceof(space, ColorSpace)) {
        // Convert string id to color space object
        color.space = ColorSpace.get(space);
    }
    if (color.alpha === undefined) {
        color.alpha = 1;
    }
    return color;
}
/**
 * Get the coordinates of a color in another color space
 *
 * @param {string | ColorSpace} space
 * @returns {number[]}
 */ function getAll(color, space) {
    space = ColorSpace.get(space);
    return space.from(color);
}
function get(color, prop) {
    var _ColorSpace_resolveCoord = ColorSpace.resolveCoord(prop, color.space), space = _ColorSpace_resolveCoord.space, index = _ColorSpace_resolveCoord.index;
    var coords = getAll(color, space);
    return coords[index];
}
function setAll(color, space, coords) {
    space = ColorSpace.get(space);
    color.coords = space.to(color.space, coords);
    return color;
}
// Set properties and return current instance
function set(color, prop, value) {
    color = getColor(color);
    if (arguments.length === 2 && type(arguments[1]) === "object") {
        // Argument is an object literal
        var object = arguments[1];
        for(var p in object){
            set(color, p, object[p]);
        }
    } else {
        if (typeof value === "function") {
            value = value(get(color, prop));
        }
        var _ColorSpace_resolveCoord = ColorSpace.resolveCoord(prop, color.space), space = _ColorSpace_resolveCoord.space, index = _ColorSpace_resolveCoord.index;
        var coords = getAll(color, space);
        coords[index] = value;
        setAll(color, space, coords);
    }
    return color;
}
var XYZ_D50 = new ColorSpace({
    id: "xyz-d50",
    name: "XYZ D50",
    white: "D50",
    base: XYZ_D65,
    fromBase: function(coords) {
        return adapt$1(XYZ_D65.white, "D50", coords);
    },
    toBase: function(coords) {
        return adapt$1("D50", XYZ_D65.white, coords);
    },
    formats: {
        color: {}
    }
});
// κ * ε  = 2^3 = 8
var ε$3 = 216 / 24389; // 6^3/29^3 == (24/116)^3
var ε3$1 = 24 / 116;
var κ$1 = 24389 / 27; // 29^3/3^3
var white$1 = WHITES.D50;
var lab = new ColorSpace({
    id: "lab",
    name: "Lab",
    coords: {
        l: {
            refRange: [
                0,
                100
            ],
            name: "L"
        },
        a: {
            refRange: [
                -125,
                125
            ]
        },
        b: {
            refRange: [
                -125,
                125
            ]
        }
    },
    // Assuming XYZ is relative to D50, convert to CIE Lab
    // from CIE standard, which now defines these as a rational fraction
    white: white$1,
    base: XYZ_D50,
    // Convert D50-adapted XYX to Lab
    //  CIE 15.3:2004 section 8.2.1.1
    fromBase: function fromBase(XYZ) {
        // compute xyz, which is XYZ scaled relative to reference white
        var xyz = XYZ.map(function(value, i) {
            return value / white$1[i];
        });
        // now compute f
        var f = xyz.map(function(value) {
            return value > ε$3 ? Math.cbrt(value) : (κ$1 * value + 16) / 116;
        });
        return [
            116 * f[1] - 16,
            500 * (f[0] - f[1]),
            200 * (f[1] - f[2] // b
            )
        ];
    },
    // Convert Lab to D50-adapted XYZ
    // Same result as CIE 15.3:2004 Appendix D although the derivation is different
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    toBase: function toBase(Lab) {
        // compute f, starting with the luminance-related term
        var f = [];
        f[1] = (Lab[0] + 16) / 116;
        f[0] = Lab[1] / 500 + f[1];
        f[2] = f[1] - Lab[2] / 200;
        // compute xyz
        var xyz = [
            f[0] > ε3$1 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ$1,
            Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ$1,
            f[2] > ε3$1 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ$1
        ];
        // Compute XYZ by scaling xyz by reference white
        return xyz.map(function(value, i) {
            return value * white$1[i];
        });
    },
    formats: {
        "lab": {
            coords: [
                "<number> | <percentage>",
                "<number> | <percentage>[-1,1]",
                "<number> | <percentage>[-1,1]"
            ]
        }
    }
});
function constrain(angle) {
    return (angle % 360 + 360) % 360;
}
function adjust(arc, angles) {
    if (arc === "raw") {
        return angles;
    }
    var _angles_map = _sliced_to_array(angles.map(constrain), 2), a1 = _angles_map[0], a2 = _angles_map[1];
    var angleDiff = a2 - a1;
    if (arc === "increasing") {
        if (angleDiff < 0) {
            a2 += 360;
        }
    } else if (arc === "decreasing") {
        if (angleDiff > 0) {
            a1 += 360;
        }
    } else if (arc === "longer") {
        if (-180 < angleDiff && angleDiff < 180) {
            if (angleDiff > 0) {
                a1 += 360;
            } else {
                a2 += 360;
            }
        }
    } else if (arc === "shorter") {
        if (angleDiff > 180) {
            a1 += 360;
        } else if (angleDiff < -180) {
            a2 += 360;
        }
    }
    return [
        a1,
        a2
    ];
}
var lch = new ColorSpace({
    id: "lch",
    name: "LCH",
    coords: {
        l: {
            refRange: [
                0,
                100
            ],
            name: "Lightness"
        },
        c: {
            refRange: [
                0,
                150
            ],
            name: "Chroma"
        },
        h: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        }
    },
    base: lab,
    fromBase: function fromBase(Lab) {
        // Convert to polar form
        var _Lab = _sliced_to_array(Lab, 3), L = _Lab[0], a = _Lab[1], b = _Lab[2];
        var hue;
        var ε = 0.02;
        if (Math.abs(a) < ε && Math.abs(b) < ε) {
            hue = NaN;
        } else {
            hue = Math.atan2(b, a) * 180 / Math.PI;
        }
        return [
            L,
            Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
            constrain(hue) // Hue, in degrees [0 to 360)
        ];
    },
    toBase: function toBase(LCH) {
        // Convert from polar form
        var _LCH = _sliced_to_array(LCH, 3), Lightness = _LCH[0], Chroma = _LCH[1], Hue = _LCH[2];
        // Clamp any negative Chroma
        if (Chroma < 0) {
            Chroma = 0;
        } // Deal with NaN Hue
        if (isNaN(Hue)) {
            Hue = 0;
        }
        return [
            Lightness,
            Chroma * Math.cos(Hue * Math.PI / 180),
            Chroma * Math.sin(Hue * Math.PI / 180) // b
        ];
    },
    formats: {
        "lch": {
            coords: [
                "<number> | <percentage>",
                "<number> | <percentage>",
                "<number> | <angle>"
            ]
        }
    }
});
// deltaE2000 is a statistically significant improvement
// and is recommended by the CIE and Idealliance
// especially for color differences less than 10 deltaE76
// but is wicked complicated
// and many implementations have small errors!
// DeltaE2000 is also discontinuous; in case this
// matters to you, use deltaECMC instead.
var Gfactor = Math.pow(25, 7);
var π$1 = Math.PI;
var r2d = 180 / π$1;
var d2r$1 = π$1 / 180;
function deltaE2000(color, sample) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref_kL = _ref.kL, kL = _ref_kL === void 0 ? 1 : _ref_kL, _ref_kC = _ref.kC, kC = _ref_kC === void 0 ? 1 : _ref_kC, _ref_kH = _ref.kH, kH = _ref_kH === void 0 ? 1 : _ref_kH;
    // Given this color as the reference
    // and the function parameter as the sample,
    // calculate deltaE 2000.
    // This implementation assumes the parametric
    // weighting factors kL, kC and kH
    // for the influence of viewing conditions
    // are all 1, as sadly seems typical.
    // kL should be increased for lightness texture or noise
    // and kC increased for chroma noise
    var _lab_from = _sliced_to_array(lab.from(color), 3), L1 = _lab_from[0], a1 = _lab_from[1], b1 = _lab_from[2];
    var C1 = lch.from(lab, [
        L1,
        a1,
        b1
    ])[1];
    var _lab_from1 = _sliced_to_array(lab.from(sample), 3), L2 = _lab_from1[0], a2 = _lab_from1[1], b2 = _lab_from1[2];
    var C2 = lch.from(lab, [
        L2,
        a2,
        b2
    ])[1];
    // Check for negative Chroma,
    // which might happen through
    // direct user input of LCH values
    if (C1 < 0) {
        C1 = 0;
    }
    if (C2 < 0) {
        C2 = 0;
    }
    var Cbar = (C1 + C2) / 2; // mean Chroma
    // calculate a-axis asymmetry factor from mean Chroma
    // this turns JND ellipses for near-neutral colors back into circles
    var C7 = Math.pow(Cbar, 7);
    var G = 0.5 * (1 - Math.sqrt(C7 / (C7 + Gfactor)));
    // scale a axes by asymmetry factor
    // this by the way is why there is no Lab2000 colorspace
    var adash1 = (1 + G) * a1;
    var adash2 = (1 + G) * a2;
    // calculate new Chroma from scaled a and original b axes
    var Cdash1 = Math.sqrt(Math.pow(adash1, 2) + Math.pow(b1, 2));
    var Cdash2 = Math.sqrt(Math.pow(adash2, 2) + Math.pow(b2, 2));
    // calculate new hues, with zero hue for true neutrals
    // and in degrees, not radians
    var h1 = adash1 === 0 && b1 === 0 ? 0 : Math.atan2(b1, adash1);
    var h2 = adash2 === 0 && b2 === 0 ? 0 : Math.atan2(b2, adash2);
    if (h1 < 0) {
        h1 += 2 * π$1;
    }
    if (h2 < 0) {
        h2 += 2 * π$1;
    }
    h1 *= r2d;
    h2 *= r2d;
    // Lightness and Chroma differences; sign matters
    var ΔL = L2 - L1;
    var ΔC = Cdash2 - Cdash1;
    // Hue difference, getting the sign correct
    var hdiff = h2 - h1;
    var hsum = h1 + h2;
    var habs = Math.abs(hdiff);
    var Δh;
    if (Cdash1 * Cdash2 === 0) {
        Δh = 0;
    } else if (habs <= 180) {
        Δh = hdiff;
    } else if (hdiff > 180) {
        Δh = hdiff - 360;
    } else if (hdiff < -180) {
        Δh = hdiff + 360;
    } else {
        console.log("the unthinkable has happened");
    }
    // weighted Hue difference, more for larger Chroma
    var ΔH = 2 * Math.sqrt(Cdash2 * Cdash1) * Math.sin(Δh * d2r$1 / 2);
    // calculate mean Lightness and Chroma
    var Ldash = (L1 + L2) / 2;
    var Cdash = (Cdash1 + Cdash2) / 2;
    var Cdash7 = Math.pow(Cdash, 7);
    // Compensate for non-linearity in the blue region of Lab.
    // Four possibilities for hue weighting factor,
    // depending on the angles, to get the correct sign
    var hdash;
    if (Cdash1 * Cdash2 === 0) {
        hdash = hsum; // which should be zero
    } else if (habs <= 180) {
        hdash = hsum / 2;
    } else if (hsum < 360) {
        hdash = (hsum + 360) / 2;
    } else {
        hdash = (hsum - 360) / 2;
    }
    // positional corrections to the lack of uniformity of CIELAB
    // These are all trying to make JND ellipsoids more like spheres
    // SL Lightness crispening factor
    // a background with L=50 is assumed
    var lsq = Math.pow(Ldash - 50, 2);
    var SL = 1 + 0.015 * lsq / Math.sqrt(20 + lsq);
    // SC Chroma factor, similar to those in CMC and deltaE 94 formulae
    var SC = 1 + 0.045 * Cdash;
    // Cross term T for blue non-linearity
    var T = 1;
    T -= 0.17 * Math.cos((hdash - 30) * d2r$1);
    T += 0.24 * Math.cos(2 * hdash * d2r$1);
    T += 0.32 * Math.cos((3 * hdash + 6) * d2r$1);
    T -= 0.20 * Math.cos((4 * hdash - 63) * d2r$1);
    // SH Hue factor depends on Chroma,
    // as well as adjusted hue angle like deltaE94.
    var SH = 1 + 0.015 * Cdash * T;
    // RT Hue rotation term compensates for rotation of JND ellipses
    // and Munsell constant hue lines
    // in the medium-high Chroma blue region
    // (Hue 225 to 315)
    var Δθ = 30 * Math.exp(-1 * Math.pow((hdash - 275) / 25, 2));
    var RC = 2 * Math.sqrt(Cdash7 / (Cdash7 + Gfactor));
    var RT = -1 * Math.sin(2 * Δθ * d2r$1) * RC;
    // Finally calculate the deltaE, term by term as root sume of squares
    var dE = Math.pow(ΔL / (kL * SL), 2);
    dE += Math.pow(ΔC / (kC * SC), 2);
    dE += Math.pow(ΔH / (kH * SH), 2);
    dE += RT * (ΔC / (kC * SC)) * (ΔH / (kH * SH));
    return Math.sqrt(dE);
// Yay!!!
}
var ε$2 = .000075;
/**
 * Check if a color is in gamut of either its own or another color space
 * @return {Boolean} Is the color in gamut?
 */ function inGamut(color) {
    var space = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : color.space, _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref_epsilon = _ref.epsilon, epsilon = _ref_epsilon === void 0 ? ε$2 : _ref_epsilon;
    color = getColor(color);
    space = ColorSpace.get(space);
    var coords = color.coords;
    if (space !== color.space) {
        coords = space.from(color);
    }
    return space.inGamut(coords, {
        epsilon: epsilon
    });
}
function clone(color) {
    return {
        space: color.space,
        coords: color.coords.slice(),
        alpha: color.alpha
    };
}
/**
 * Force coordinates to be in gamut of a certain color space.
 * Mutates the color it is passed.
 * @param {Object} options
 * @param {string} options.method - How to force into gamut.
 *        If "clip", coordinates are just clipped to their reference range.
 *        If in the form [colorSpaceId].[coordName], that coordinate is reduced
 *        until the color is in gamut. Please note that this may produce nonsensical
 *        results for certain coordinates (e.g. hue) or infinite loops if reducing the coordinate never brings the color in gamut.
 * @param {ColorSpace|string} options.space - The space whose gamut we want to map to
 */ function toGamut(color) {
    var _ref = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}, _ref_method = _ref.method, method = _ref_method === void 0 ? defaults.gamut_mapping : _ref_method, _ref_space = _ref.space, space = _ref_space === void 0 ? color.space : _ref_space;
    if (isString(arguments[1])) {
        space = arguments[1];
    }
    space = ColorSpace.get(space);
    if (inGamut(color, space, {
        epsilon: 0
    })) {
        return getColor(color);
    }
    // 3 spaces:
    // color.space: current color space
    // space: space whose gamut we are mapping to
    // mapSpace: space with the coord we're reducing
    var spaceColor = to(color, space);
    if (method !== "clip" && !inGamut(color, space)) {
        var clipped = toGamut(clone(spaceColor), {
            method: "clip",
            space: space
        });
        if (deltaE2000(color, clipped) > 2) {
            // Reduce a coordinate of a certain color space until the color is in gamut
            var coordMeta = ColorSpace.resolveCoord(method);
            var mapSpace = coordMeta.space;
            var coordId = coordMeta.id;
            var mappedColor = to(spaceColor, mapSpace);
            var bounds = coordMeta.range || coordMeta.refRange;
            var min = bounds[0];
            var ε = .01; // for deltaE
            var low = min;
            var high = get(mappedColor, coordId);
            while(high - low > ε){
                var clipped1 = clone(mappedColor);
                clipped1 = toGamut(clipped1, {
                    space: space,
                    method: "clip"
                });
                var _$deltaE = deltaE2000(mappedColor, clipped1);
                if (_$deltaE - 2 < ε) {
                    low = get(mappedColor, coordId);
                } else {
                    high = get(mappedColor, coordId);
                }
                set(mappedColor, coordId, (low + high) / 2);
            }
            spaceColor = to(mappedColor, space);
        } else {
            spaceColor = clipped;
        }
    }
    if (method === "clip" // Dumb coord clipping
     || !inGamut(spaceColor, space, {
        epsilon: 0
    })) {
        var bounds1 = Object.values(space.coords).map(function(c) {
            return c.range || [];
        });
        spaceColor.coords = spaceColor.coords.map(function(c, i) {
            var _bounds_i = _sliced_to_array(bounds1[i], 2), min = _bounds_i[0], max = _bounds_i[1];
            if (min !== undefined) {
                c = Math.max(min, c);
            }
            if (max !== undefined) {
                c = Math.min(c, max);
            }
            return c;
        });
    }
    if (space !== color.space) {
        spaceColor = to(spaceColor, color.space);
    }
    color.coords = spaceColor.coords;
    return color;
}
toGamut.returns = "color";
/**
 * Convert to color space and return a new color
 * @param {Object|string} space - Color space object or id
 * @param {Object} options
 * @param {boolean} options.inGamut - Whether to force resulting color in gamut
 * @returns {Color}
 */ function to(color, space) {
    var _$inGamut = (arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}).inGamut;
    color = getColor(color);
    space = ColorSpace.get(space);
    var coords = space.from(color);
    var ret = {
        space: space,
        coords: coords,
        alpha: color.alpha
    };
    if (_$inGamut) {
        ret = toGamut(ret);
    }
    return ret;
}
to.returns = "color";
/**
 * Generic toString() method, outputs a color(spaceId ...coords) function, a functional syntax, or custom formats defined by the color space
 * @param {Object} options
 * @param {number} options.precision - Significant digits
 * @param {boolean} options.inGamut - Adjust coordinates to fit in gamut first? [default: false]
 */ function serialize(color) {
    var _param = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _param_precision = _param.precision, precision = _param_precision === void 0 ? defaults.precision : _param_precision, _param_format = _param.format, format = _param_format === void 0 ? "default" : _param_format, tmp = _param.inGamut, inGamut$1 = tmp === void 0 ? true : tmp, customOptions = _object_without_properties(_param, [
        "precision",
        "format",
        "inGamut"
    ]);
    var ret;
    color = getColor(color);
    var formatId = format;
    var _color_space_getFormat, _ref;
    format = (_ref = (_color_space_getFormat = color.space.getFormat(format)) !== null && _color_space_getFormat !== void 0 ? _color_space_getFormat : color.space.getFormat("default")) !== null && _ref !== void 0 ? _ref : ColorSpace.DEFAULT_FORMAT;
    inGamut$1 || (inGamut$1 = format.toGamut);
    var coords = color.coords;
    // Convert NaN to zeros to have a chance at a valid CSS color
    // Also convert -0 to 0
    // This also clones it so we can manipulate it
    coords = coords.map(function(c) {
        return c ? c : 0;
    });
    if (inGamut$1 && !inGamut(color)) {
        coords = toGamut(clone(color), inGamut$1 === true ? undefined : inGamut$1).coords;
    }
    if (format.type === "custom") {
        customOptions.precision = precision;
        if (format.serialize) {
            ret = format.serialize(coords, color.alpha, customOptions);
        } else {
            throw new TypeError("format ".concat(formatId, " can only be used to parse colors, not for serialization"));
        }
    } else {
        // Functional syntax
        var name = format.name || "color";
        if (format.serializeCoords) {
            coords = format.serializeCoords(coords, precision);
        } else {
            if (precision !== null) {
                coords = coords.map(function(c) {
                    return toPrecision(c, precision);
                });
            }
        }
        var args = _to_consumable_array(coords);
        if (name === "color") {
            var _format_ids;
            // If output is a color() function, add colorspace id as first argument
            var cssId = format.id || ((_format_ids = format.ids) === null || _format_ids === void 0 ? void 0 : _format_ids[0]) || color.space.id;
            args.unshift(cssId);
        }
        var alpha = color.alpha;
        if (precision !== null) {
            alpha = toPrecision(alpha, precision);
        }
        var strAlpha = color.alpha < 1 && !format.noAlpha ? "".concat(format.commas ? "," : " /", " ").concat(alpha) : "";
        ret = "".concat(name, "(").concat(args.join(format.commas ? ", " : " ")).concat(strAlpha, ")");
    }
    return ret;
}
// convert an array of linear-light rec2020 values to CIE XYZ
// using  D65 (no chromatic adaptation)
// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
// 0 is actually calculated as  4.994106574466076e-17
var toXYZ_M$5 = [
    [
        0.6369580483012914,
        0.14461690358620832,
        0.1688809751641721
    ],
    [
        0.2627002120112671,
        0.6779980715188708,
        0.05930171646986196
    ],
    [
        0.000000000000000,
        0.028072693049087428,
        1.060985057710791
    ]
];
// from ITU-R BT.2124-0 Annex 2 p.3
var fromXYZ_M$5 = [
    [
        1.716651187971268,
        -0.355670783776392,
        -0.253366281373660
    ],
    [
        -0.666684351832489,
        1.616481236634939,
        0.0157685458139111
    ],
    [
        0.017639857445311,
        -0.042770613257809,
        0.942103121235474
    ]
];
var REC2020Linear = new RGBColorSpace({
    id: "rec2020-linear",
    name: "Linear REC.2020",
    white: "D65",
    toXYZ_M: toXYZ_M$5,
    fromXYZ_M: fromXYZ_M$5,
    formats: {
        color: {}
    }
});
// import sRGB from "./srgb.js";
var α = 1.09929682680944;
var β = 0.018053968510807;
var REC2020 = new RGBColorSpace({
    id: "rec2020",
    name: "REC.2020",
    base: REC2020Linear,
    // Non-linear transfer function from Rec. ITU-R BT.2020-2 table 4
    toBase: function toBase(RGB) {
        return RGB.map(function(val) {
            if (val < β * 4.5) {
                return val / 4.5;
            }
            return Math.pow((val + α - 1) / α, 1 / 0.45);
        });
    },
    fromBase: function fromBase(RGB) {
        return RGB.map(function(val) {
            if (val >= β) {
                return α * Math.pow(val, 0.45) - (α - 1);
            }
            return 4.5 * val;
        });
    },
    formats: {
        color: {}
    }
});
var toXYZ_M$4 = [
    [
        0.4865709486482162,
        0.26566769316909306,
        0.1982172852343625
    ],
    [
        0.2289745640697488,
        0.6917385218365064,
        0.079286914093745
    ],
    [
        0.0000000000000000,
        0.04511338185890264,
        1.043944368900976
    ]
];
var fromXYZ_M$4 = [
    [
        2.493496911941425,
        -0.9313836179191239,
        -0.40271078445071684
    ],
    [
        -0.8294889695615747,
        1.7626640603183463,
        0.023624685841943577
    ],
    [
        0.03584583024378447,
        -0.07617238926804182,
        0.9568845240076872
    ]
];
var P3Linear = new RGBColorSpace({
    id: "p3-linear",
    name: "Linear P3",
    white: "D65",
    toXYZ_M: toXYZ_M$4,
    fromXYZ_M: fromXYZ_M$4
});
// This is the linear-light version of sRGB
// as used for example in SVG filters
// or in Canvas
// This matrix was calculated directly from the RGB and white chromaticities
// when rounded to 8 decimal places, it agrees completely with the official matrix
// see https://github.com/w3c/csswg-drafts/issues/5922
var toXYZ_M$3 = [
    [
        0.41239079926595934,
        0.357584339383878,
        0.1804807884018343
    ],
    [
        0.21263900587151027,
        0.715168678767756,
        0.07219231536073371
    ],
    [
        0.01933081871559182,
        0.11919477979462598,
        0.9505321522496607
    ]
];
// This matrix is the inverse of the above;
// again it agrees with the official definition when rounded to 8 decimal places
var fromXYZ_M$3 = [
    [
        3.2409699419045226,
        -1.537383177570094,
        -0.4986107602930034
    ],
    [
        -0.9692436362808796,
        1.8759675015077202,
        0.04155505740717559
    ],
    [
        0.05563007969699366,
        -0.20397695888897652,
        1.0569715142428786
    ]
];
var sRGBLinear = new RGBColorSpace({
    id: "srgb-linear",
    name: "Linear sRGB",
    white: "D65",
    toXYZ_M: toXYZ_M$3,
    fromXYZ_M: fromXYZ_M$3,
    formats: {
        color: {}
    }
});
/* List of CSS color keywords
 * Note that this does not include currentColor, transparent,
 * or system colors
 */ // To produce: Visit https://www.w3.org/TR/css-color-4/#named-colors
// and run in the console:
// copy($$("tr", $(".named-color-table tbody")).map(tr => `"${tr.cells[2].textContent.trim()}": [${tr.cells[4].textContent.trim().split(/\s+/).map(c => c === "0"? "0" : c === "255"? "1" : c + " / 255").join(", ")}]`).join(",\n"))
var KEYWORDS = {
    "aliceblue": [
        240 / 255,
        248 / 255,
        1
    ],
    "antiquewhite": [
        250 / 255,
        235 / 255,
        215 / 255
    ],
    "aqua": [
        0,
        1,
        1
    ],
    "aquamarine": [
        127 / 255,
        1,
        212 / 255
    ],
    "azure": [
        240 / 255,
        1,
        1
    ],
    "beige": [
        245 / 255,
        245 / 255,
        220 / 255
    ],
    "bisque": [
        1,
        228 / 255,
        196 / 255
    ],
    "black": [
        0,
        0,
        0
    ],
    "blanchedalmond": [
        1,
        235 / 255,
        205 / 255
    ],
    "blue": [
        0,
        0,
        1
    ],
    "blueviolet": [
        138 / 255,
        43 / 255,
        226 / 255
    ],
    "brown": [
        165 / 255,
        42 / 255,
        42 / 255
    ],
    "burlywood": [
        222 / 255,
        184 / 255,
        135 / 255
    ],
    "cadetblue": [
        95 / 255,
        158 / 255,
        160 / 255
    ],
    "chartreuse": [
        127 / 255,
        1,
        0
    ],
    "chocolate": [
        210 / 255,
        105 / 255,
        30 / 255
    ],
    "coral": [
        1,
        127 / 255,
        80 / 255
    ],
    "cornflowerblue": [
        100 / 255,
        149 / 255,
        237 / 255
    ],
    "cornsilk": [
        1,
        248 / 255,
        220 / 255
    ],
    "crimson": [
        220 / 255,
        20 / 255,
        60 / 255
    ],
    "cyan": [
        0,
        1,
        1
    ],
    "darkblue": [
        0,
        0,
        139 / 255
    ],
    "darkcyan": [
        0,
        139 / 255,
        139 / 255
    ],
    "darkgoldenrod": [
        184 / 255,
        134 / 255,
        11 / 255
    ],
    "darkgray": [
        169 / 255,
        169 / 255,
        169 / 255
    ],
    "darkgreen": [
        0,
        100 / 255,
        0
    ],
    "darkgrey": [
        169 / 255,
        169 / 255,
        169 / 255
    ],
    "darkkhaki": [
        189 / 255,
        183 / 255,
        107 / 255
    ],
    "darkmagenta": [
        139 / 255,
        0,
        139 / 255
    ],
    "darkolivegreen": [
        85 / 255,
        107 / 255,
        47 / 255
    ],
    "darkorange": [
        1,
        140 / 255,
        0
    ],
    "darkorchid": [
        153 / 255,
        50 / 255,
        204 / 255
    ],
    "darkred": [
        139 / 255,
        0,
        0
    ],
    "darksalmon": [
        233 / 255,
        150 / 255,
        122 / 255
    ],
    "darkseagreen": [
        143 / 255,
        188 / 255,
        143 / 255
    ],
    "darkslateblue": [
        72 / 255,
        61 / 255,
        139 / 255
    ],
    "darkslategray": [
        47 / 255,
        79 / 255,
        79 / 255
    ],
    "darkslategrey": [
        47 / 255,
        79 / 255,
        79 / 255
    ],
    "darkturquoise": [
        0,
        206 / 255,
        209 / 255
    ],
    "darkviolet": [
        148 / 255,
        0,
        211 / 255
    ],
    "deeppink": [
        1,
        20 / 255,
        147 / 255
    ],
    "deepskyblue": [
        0,
        191 / 255,
        1
    ],
    "dimgray": [
        105 / 255,
        105 / 255,
        105 / 255
    ],
    "dimgrey": [
        105 / 255,
        105 / 255,
        105 / 255
    ],
    "dodgerblue": [
        30 / 255,
        144 / 255,
        1
    ],
    "firebrick": [
        178 / 255,
        34 / 255,
        34 / 255
    ],
    "floralwhite": [
        1,
        250 / 255,
        240 / 255
    ],
    "forestgreen": [
        34 / 255,
        139 / 255,
        34 / 255
    ],
    "fuchsia": [
        1,
        0,
        1
    ],
    "gainsboro": [
        220 / 255,
        220 / 255,
        220 / 255
    ],
    "ghostwhite": [
        248 / 255,
        248 / 255,
        1
    ],
    "gold": [
        1,
        215 / 255,
        0
    ],
    "goldenrod": [
        218 / 255,
        165 / 255,
        32 / 255
    ],
    "gray": [
        128 / 255,
        128 / 255,
        128 / 255
    ],
    "green": [
        0,
        128 / 255,
        0
    ],
    "greenyellow": [
        173 / 255,
        1,
        47 / 255
    ],
    "grey": [
        128 / 255,
        128 / 255,
        128 / 255
    ],
    "honeydew": [
        240 / 255,
        1,
        240 / 255
    ],
    "hotpink": [
        1,
        105 / 255,
        180 / 255
    ],
    "indianred": [
        205 / 255,
        92 / 255,
        92 / 255
    ],
    "indigo": [
        75 / 255,
        0,
        130 / 255
    ],
    "ivory": [
        1,
        1,
        240 / 255
    ],
    "khaki": [
        240 / 255,
        230 / 255,
        140 / 255
    ],
    "lavender": [
        230 / 255,
        230 / 255,
        250 / 255
    ],
    "lavenderblush": [
        1,
        240 / 255,
        245 / 255
    ],
    "lawngreen": [
        124 / 255,
        252 / 255,
        0
    ],
    "lemonchiffon": [
        1,
        250 / 255,
        205 / 255
    ],
    "lightblue": [
        173 / 255,
        216 / 255,
        230 / 255
    ],
    "lightcoral": [
        240 / 255,
        128 / 255,
        128 / 255
    ],
    "lightcyan": [
        224 / 255,
        1,
        1
    ],
    "lightgoldenrodyellow": [
        250 / 255,
        250 / 255,
        210 / 255
    ],
    "lightgray": [
        211 / 255,
        211 / 255,
        211 / 255
    ],
    "lightgreen": [
        144 / 255,
        238 / 255,
        144 / 255
    ],
    "lightgrey": [
        211 / 255,
        211 / 255,
        211 / 255
    ],
    "lightpink": [
        1,
        182 / 255,
        193 / 255
    ],
    "lightsalmon": [
        1,
        160 / 255,
        122 / 255
    ],
    "lightseagreen": [
        32 / 255,
        178 / 255,
        170 / 255
    ],
    "lightskyblue": [
        135 / 255,
        206 / 255,
        250 / 255
    ],
    "lightslategray": [
        119 / 255,
        136 / 255,
        153 / 255
    ],
    "lightslategrey": [
        119 / 255,
        136 / 255,
        153 / 255
    ],
    "lightsteelblue": [
        176 / 255,
        196 / 255,
        222 / 255
    ],
    "lightyellow": [
        1,
        1,
        224 / 255
    ],
    "lime": [
        0,
        1,
        0
    ],
    "limegreen": [
        50 / 255,
        205 / 255,
        50 / 255
    ],
    "linen": [
        250 / 255,
        240 / 255,
        230 / 255
    ],
    "magenta": [
        1,
        0,
        1
    ],
    "maroon": [
        128 / 255,
        0,
        0
    ],
    "mediumaquamarine": [
        102 / 255,
        205 / 255,
        170 / 255
    ],
    "mediumblue": [
        0,
        0,
        205 / 255
    ],
    "mediumorchid": [
        186 / 255,
        85 / 255,
        211 / 255
    ],
    "mediumpurple": [
        147 / 255,
        112 / 255,
        219 / 255
    ],
    "mediumseagreen": [
        60 / 255,
        179 / 255,
        113 / 255
    ],
    "mediumslateblue": [
        123 / 255,
        104 / 255,
        238 / 255
    ],
    "mediumspringgreen": [
        0,
        250 / 255,
        154 / 255
    ],
    "mediumturquoise": [
        72 / 255,
        209 / 255,
        204 / 255
    ],
    "mediumvioletred": [
        199 / 255,
        21 / 255,
        133 / 255
    ],
    "midnightblue": [
        25 / 255,
        25 / 255,
        112 / 255
    ],
    "mintcream": [
        245 / 255,
        1,
        250 / 255
    ],
    "mistyrose": [
        1,
        228 / 255,
        225 / 255
    ],
    "moccasin": [
        1,
        228 / 255,
        181 / 255
    ],
    "navajowhite": [
        1,
        222 / 255,
        173 / 255
    ],
    "navy": [
        0,
        0,
        128 / 255
    ],
    "oldlace": [
        253 / 255,
        245 / 255,
        230 / 255
    ],
    "olive": [
        128 / 255,
        128 / 255,
        0
    ],
    "olivedrab": [
        107 / 255,
        142 / 255,
        35 / 255
    ],
    "orange": [
        1,
        165 / 255,
        0
    ],
    "orangered": [
        1,
        69 / 255,
        0
    ],
    "orchid": [
        218 / 255,
        112 / 255,
        214 / 255
    ],
    "palegoldenrod": [
        238 / 255,
        232 / 255,
        170 / 255
    ],
    "palegreen": [
        152 / 255,
        251 / 255,
        152 / 255
    ],
    "paleturquoise": [
        175 / 255,
        238 / 255,
        238 / 255
    ],
    "palevioletred": [
        219 / 255,
        112 / 255,
        147 / 255
    ],
    "papayawhip": [
        1,
        239 / 255,
        213 / 255
    ],
    "peachpuff": [
        1,
        218 / 255,
        185 / 255
    ],
    "peru": [
        205 / 255,
        133 / 255,
        63 / 255
    ],
    "pink": [
        1,
        192 / 255,
        203 / 255
    ],
    "plum": [
        221 / 255,
        160 / 255,
        221 / 255
    ],
    "powderblue": [
        176 / 255,
        224 / 255,
        230 / 255
    ],
    "purple": [
        128 / 255,
        0,
        128 / 255
    ],
    "rebeccapurple": [
        102 / 255,
        51 / 255,
        153 / 255
    ],
    "red": [
        1,
        0,
        0
    ],
    "rosybrown": [
        188 / 255,
        143 / 255,
        143 / 255
    ],
    "royalblue": [
        65 / 255,
        105 / 255,
        225 / 255
    ],
    "saddlebrown": [
        139 / 255,
        69 / 255,
        19 / 255
    ],
    "salmon": [
        250 / 255,
        128 / 255,
        114 / 255
    ],
    "sandybrown": [
        244 / 255,
        164 / 255,
        96 / 255
    ],
    "seagreen": [
        46 / 255,
        139 / 255,
        87 / 255
    ],
    "seashell": [
        1,
        245 / 255,
        238 / 255
    ],
    "sienna": [
        160 / 255,
        82 / 255,
        45 / 255
    ],
    "silver": [
        192 / 255,
        192 / 255,
        192 / 255
    ],
    "skyblue": [
        135 / 255,
        206 / 255,
        235 / 255
    ],
    "slateblue": [
        106 / 255,
        90 / 255,
        205 / 255
    ],
    "slategray": [
        112 / 255,
        128 / 255,
        144 / 255
    ],
    "slategrey": [
        112 / 255,
        128 / 255,
        144 / 255
    ],
    "snow": [
        1,
        250 / 255,
        250 / 255
    ],
    "springgreen": [
        0,
        1,
        127 / 255
    ],
    "steelblue": [
        70 / 255,
        130 / 255,
        180 / 255
    ],
    "tan": [
        210 / 255,
        180 / 255,
        140 / 255
    ],
    "teal": [
        0,
        128 / 255,
        128 / 255
    ],
    "thistle": [
        216 / 255,
        191 / 255,
        216 / 255
    ],
    "tomato": [
        1,
        99 / 255,
        71 / 255
    ],
    "turquoise": [
        64 / 255,
        224 / 255,
        208 / 255
    ],
    "violet": [
        238 / 255,
        130 / 255,
        238 / 255
    ],
    "wheat": [
        245 / 255,
        222 / 255,
        179 / 255
    ],
    "white": [
        1,
        1,
        1
    ],
    "whitesmoke": [
        245 / 255,
        245 / 255,
        245 / 255
    ],
    "yellow": [
        1,
        1,
        0
    ],
    "yellowgreen": [
        154 / 255,
        205 / 255,
        50 / 255
    ]
};
var coordGrammar = Array(3).fill("<percentage> | <number>[0, 255]");
var coordGrammarNumber = Array(3).fill("<number>[0, 255]");
var sRGB = new RGBColorSpace({
    id: "srgb",
    name: "sRGB",
    base: sRGBLinear,
    fromBase: function(rgb) {
        // convert an array of linear-light sRGB values in the range 0.0-1.0
        // to gamma corrected form
        // https://en.wikipedia.org/wiki/SRGB
        return rgb.map(function(val) {
            var sign = val < 0 ? -1 : 1;
            var abs = val * sign;
            if (abs > 0.0031308) {
                return sign * (1.055 * Math.pow(abs, 1 / 2.4) - 0.055);
            }
            return 12.92 * val;
        });
    },
    toBase: function(rgb) {
        // convert an array of sRGB values in the range 0.0 - 1.0
        // to linear light (un-companded) form.
        // https://en.wikipedia.org/wiki/SRGB
        return rgb.map(function(val) {
            var sign = val < 0 ? -1 : 1;
            var abs = val * sign;
            if (abs < 0.04045) {
                return val / 12.92;
            }
            return sign * Math.pow((abs + 0.055) / 1.055, 2.4);
        });
    },
    formats: {
        "rgb": {
            coords: coordGrammar
        },
        "rgb_number": {
            name: "rgb",
            commas: true,
            coords: coordGrammarNumber,
            noAlpha: true
        },
        "color": {},
        "rgba": {
            coords: coordGrammar,
            commas: true,
            lastAlpha: true
        },
        "rgba_number": {
            name: "rgba",
            commas: true,
            coords: coordGrammarNumber
        },
        "hex": {
            type: "custom",
            toGamut: true,
            test: function(str) {
                return /^#([a-f0-9]{3,4}){1,2}$/i.test(str);
            },
            parse: function parse(str) {
                if (str.length <= 5) {
                    // #rgb or #rgba, duplicate digits
                    str = str.replace(/[a-f0-9]/gi, "$&$&");
                }
                var rgba = [];
                str.replace(/[a-f0-9]{2}/gi, function(component) {
                    rgba.push(parseInt(component, 16) / 255);
                });
                return {
                    spaceId: "srgb",
                    coords: rgba.slice(0, 3),
                    alpha: rgba.slice(3)[0]
                };
            },
            serialize: function(coords, alpha) {
                var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref_collapse = _ref.collapse, collapse = _ref_collapse === void 0 ? true // collapse to 3-4 digit hex when possible?
                 : _ref_collapse;
                if (alpha < 1) {
                    coords.push(alpha);
                }
                coords = coords.map(function(c) {
                    return Math.round(c * 255);
                });
                var collapsible = collapse && coords.every(function(c) {
                    return c % 17 === 0;
                });
                var hex = coords.map(function(c) {
                    if (collapsible) {
                        return (c / 17).toString(16);
                    }
                    return c.toString(16).padStart(2, "0");
                }).join("");
                return "#" + hex;
            }
        },
        "keyword": {
            type: "custom",
            test: function(str) {
                return /^[a-z]+$/i.test(str);
            },
            parse: function parse(str) {
                str = str.toLowerCase();
                var ret = {
                    spaceId: "srgb",
                    coords: null,
                    alpha: 1
                };
                if (str === "transparent") {
                    ret.coords = KEYWORDS.black;
                    ret.alpha = 0;
                } else {
                    ret.coords = KEYWORDS[str];
                }
                if (ret.coords) {
                    return ret;
                }
            }
        }
    }
});
var P3 = new RGBColorSpace({
    id: "p3",
    name: "P3",
    base: P3Linear,
    // Gamma encoding/decoding is the same as sRGB
    fromBase: sRGB.fromBase,
    toBase: sRGB.toBase,
    formats: {
        color: {
            id: "display-p3"
        }
    }
});
// Default space for CSS output. Code in Color.js makes this wider if there's a DOM available
defaults.display_space = sRGB;
if (typeof CSS !== "undefined" && CSS.supports) {
    // Find widest supported color space for CSS
    for(var _i = 0, _iter = [
        lab,
        REC2020,
        P3
    ]; _i < _iter.length; _i++){
        var space = _iter[_i];
        var coords = space.getMinCoords();
        var color = {
            space: space,
            coords: coords,
            alpha: 1
        };
        var str = serialize(color);
        if (CSS.supports("color", str)) {
            defaults.display_space = space;
            break;
        }
    }
}
/**
 * Returns a serialization of the color that can actually be displayed in the browser.
 * If the default serialization can be displayed, it is returned.
 * Otherwise, the color is converted to Lab, REC2020, or P3, whichever is the widest supported.
 * In Node.js, this is basically equivalent to `serialize()` but returns a `String` object instead.
 *
 * @export
 * @param {{space, coords} | Color | string} color
 * @param {*} [options={}] Options to be passed to serialize()
 * @param {ColorSpace | string} [options.space = defaults.display_space] Color space to use for serialization if default is not supported
 * @returns {String} String object containing the serialized color with a color property containing the converted color (or the original, if no conversion was necessary)
 */ function display(color) {
    var _param = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var _param_space = _param.space, space = _param_space === void 0 ? defaults.display_space : _param_space, options = _object_without_properties(_param, [
        "space"
    ]);
    var ret = serialize(color, options);
    if (typeof CSS === "undefined" || CSS.supports("color", ret) || !defaults.display_space) {
        ret = new String(ret);
        ret.color = color;
    } else {
        // If we're here, what we were about to output is not supported
        // Fall back to fallback space
        var fallbackColor = to(color, space);
        ret = new String(serialize(fallbackColor, options));
        ret.color = fallbackColor;
    }
    return ret;
}
/**
 * Euclidean distance of colors in an arbitrary color space
 */ function distance(color1, color2) {
    var space = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "lab";
    space = ColorSpace.get(space);
    var coords1 = space.from(color1);
    var coords2 = space.from(color2);
    return Math.sqrt(coords1.reduce(function(acc, c1, i) {
        var c2 = coords2[i];
        if (isNaN(c1) || isNaN(c2)) {
            return acc;
        }
        return acc + Math.pow(c2 - c1, 2);
    }, 0));
}
function equals(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    return color1.space === color2.space && color1.alpha === color2.alpha && color1.coords.every(function(c, i) {
        return c === color2.coords[i];
    });
}
/**
 * Relative luminance
 */ function getLuminance(color) {
    return get(color, [
        XYZ_D65,
        "y"
    ]);
}
function setLuminance(color, value) {
    set(color, [
        XYZ_D65,
        "y"
    ], value);
}
function register$2(Color) {
    Object.defineProperty(Color.prototype, "luminance", {
        get: function get() {
            return getLuminance(this);
        },
        set: function set(value) {
            setLuminance(this, value);
        }
    });
}
var luminance = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    getLuminance: getLuminance,
    register: register$2,
    setLuminance: setLuminance
});
// WCAG 2.0 contrast https://www.w3.org/TR/WCAG20-TECHS/G18.html
// Simple contrast, with fixed 5% viewing flare contribution
// Symmetric, does not matter which is foreground and which is background
function contrastWCAG21(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    var Y1 = Math.max(getLuminance(color1), 0);
    var Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
        var ref;
        ref = [
            Y2,
            Y1
        ], Y1 = ref[0], Y2 = ref[1], ref;
    }
    return (Y1 + .05) / (Y2 + .05);
}
// APCA 0.0.98G
// https://github.com/Myndex/apca-w3
// see also https://github.com/w3c/silver/issues/643
// exponents
var normBG = 0.56;
var normTXT = 0.57;
var revTXT = 0.62;
var revBG = 0.65;
// clamps
var blkThrs = 0.022;
var blkClmp = 1.414;
var loClip = 0.1;
var deltaYmin = 0.0005;
// scalers
// see https://github.com/w3c/silver/issues/645
var scaleBoW = 1.14;
var loBoWoffset = 0.027;
var scaleWoB = 1.14;
function fclamp(Y) {
    if (Y >= blkThrs) {
        return Y;
    }
    return Y + Math.pow(blkThrs - Y, blkClmp);
}
function linearize(val) {
    var sign = val < 0 ? -1 : 1;
    var abs = Math.abs(val);
    return sign * Math.pow(abs, 2.4);
}
// Not symmetric, requires a foreground (text) color, and a background color
function contrastAPCA(background, foreground) {
    foreground = getColor(foreground);
    background = getColor(background);
    var S;
    var C;
    var Sapc;
    // Myndex as-published, assumes sRGB inputs
    var R, G, B;
    foreground = to(foreground, "srgb");
    var ref;
    // Should these be clamped to in-gamut values?
    // Calculates "screen luminance" with non-standard simple gamma EOTF
    // weights should be from CSS Color 4, not the ones here which are via Myndex and copied from Lindbloom
    ref = _sliced_to_array(foreground.coords, 3), R = ref[0], G = ref[1], B = ref[2], ref;
    var lumTxt = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.0721750;
    background = to(background, "srgb");
    var ref1;
    ref1 = _sliced_to_array(background.coords, 3), R = ref1[0], G = ref1[1], B = ref1[2], ref1;
    var lumBg = linearize(R) * 0.2126729 + linearize(G) * 0.7151522 + linearize(B) * 0.0721750;
    // toe clamping of very dark values to account for flare
    var Ytxt = fclamp(lumTxt);
    var Ybg = fclamp(lumBg);
    // are we "Black on White" (dark on light), or light on dark?
    var BoW = Ybg > Ytxt;
    // why is this a delta, when Y is not perceptually uniform?
    // Answer: it is a noise gate, see
    // https://github.com/LeaVerou/color.js/issues/208
    if (Math.abs(Ybg - Ytxt) < deltaYmin) {
        C = 0;
    } else {
        if (BoW) {
            // dark text on light background
            S = Math.pow(Ybg, normBG) - Math.pow(Ytxt, normTXT);
            C = S * scaleBoW;
        } else {
            // light text on dark background
            S = Math.pow(Ybg, revBG) - Math.pow(Ytxt, revTXT);
            C = S * scaleWoB;
        }
    }
    if (Math.abs(C) < loClip) {
        Sapc = 0;
    } else if (C > 0) {
        // not clear whether Woffset is loBoWoffset or loWoBoffset
        // but they have the same value
        Sapc = C - loBoWoffset;
    } else {
        Sapc = C + loBoWoffset;
    }
    return Sapc * 100;
}
// Michelson  luminance contrast
// the relation between the spread and the sum of the two luminances
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.
function contrastMichelson(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    var Y1 = Math.max(getLuminance(color1), 0);
    var Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
        var ref;
        ref = [
            Y2,
            Y1
        ], Y1 = ref[0], Y2 = ref[1], ref;
    }
    var denom = Y1 + Y2;
    return denom === 0 ? 0 : (Y1 - Y2) / denom;
}
// Weber luminance contrast
// The difference between the two luminances divided by the lower luminance
// Symmetric, does not matter which is foreground and which is background
// No black level compensation for flare.
// the darkest sRGB color above black is #000001 and this produces
// a plain Weber contrast of ~45647.
// So, setting the divide-by-zero result at 50000 is a reasonable
// max clamp for the plain Weber
var max = 50000;
function contrastWeber(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    var Y1 = Math.max(getLuminance(color1), 0);
    var Y2 = Math.max(getLuminance(color2), 0);
    if (Y2 > Y1) {
        var ref;
        ref = [
            Y2,
            Y1
        ], Y1 = ref[0], Y2 = ref[1], ref;
    }
    return Y2 === 0 ? max : (Y1 - Y2) / Y2;
}
// CIE Lightness difference, as used by Google Material Design
// Google HCT Tone is the same as CIE Lightness
// https://material.io/blog/science-of-color-design
function contrastLstar(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    var L1 = get(color1, [
        lab,
        "l"
    ]);
    var L2 = get(color2, [
        lab,
        "l"
    ]);
    return Math.abs(L1 - L2);
}
// κ * ε  = 2^3 = 8
var ε$1 = 216 / 24389; // 6^3/29^3 == (24/116)^3
var ε3 = 24 / 116;
var κ = 24389 / 27; // 29^3/3^3
var white = WHITES.D65;
var lab_d65 = new ColorSpace({
    id: "lab-d65",
    name: "Lab D65",
    coords: {
        l: {
            refRange: [
                0,
                100
            ],
            name: "L"
        },
        a: {
            refRange: [
                -125,
                125
            ]
        },
        b: {
            refRange: [
                -125,
                125
            ]
        }
    },
    // Assuming XYZ is relative to D65, convert to CIE Lab
    // from CIE standard, which now defines these as a rational fraction
    white: white,
    base: XYZ_D65,
    // Convert D65-adapted XYZ to Lab
    //  CIE 15.3:2004 section 8.2.1.1
    fromBase: function fromBase(XYZ) {
        // compute xyz, which is XYZ scaled relative to reference white
        var xyz = XYZ.map(function(value, i) {
            return value / white[i];
        });
        // now compute f
        var f = xyz.map(function(value) {
            return value > ε$1 ? Math.cbrt(value) : (κ * value + 16) / 116;
        });
        return [
            116 * f[1] - 16,
            500 * (f[0] - f[1]),
            200 * (f[1] - f[2] // b
            )
        ];
    },
    // Convert Lab to D65-adapted XYZ
    // Same result as CIE 15.3:2004 Appendix D although the derivation is different
    // http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
    toBase: function toBase(Lab) {
        // compute f, starting with the luminance-related term
        var f = [];
        f[1] = (Lab[0] + 16) / 116;
        f[0] = Lab[1] / 500 + f[1];
        f[2] = f[1] - Lab[2] / 200;
        // compute xyz
        var xyz = [
            f[0] > ε3 ? Math.pow(f[0], 3) : (116 * f[0] - 16) / κ,
            Lab[0] > 8 ? Math.pow((Lab[0] + 16) / 116, 3) : Lab[0] / κ,
            f[2] > ε3 ? Math.pow(f[2], 3) : (116 * f[2] - 16) / κ
        ];
        // Compute XYZ by scaling xyz by reference white
        return xyz.map(function(value, i) {
            return value * white[i];
        });
    },
    formats: {
        "lab-d65": {
            coords: [
                "<number> | <percentage>",
                "<number> | <percentage>[-1,1]",
                "<number> | <percentage>[-1,1]"
            ]
        }
    }
});
// Delta Phi Star perceptual lightness contrast
// See https://github.com/Myndex/deltaphistar
// The (difference between two Lstars each raised to phi) raised to (1/phi)
// Symmetric, does not matter which is foreground and which is background
var phi = Math.pow(5, 0.5) * 0.5 + 0.5; // Math.phi can be used if Math.js
function contrastDeltaPhi(color1, color2) {
    color1 = getColor(color1);
    color2 = getColor(color2);
    var Lstr1 = get(color1, [
        lab_d65,
        "l"
    ]);
    var Lstr2 = get(color2, [
        lab_d65,
        "l"
    ]);
    var deltaPhiStar = Math.abs(Math.pow(Lstr1, phi) - Math.pow(Lstr2, phi));
    var _$contrast = Math.pow(deltaPhiStar, 1 / phi) * Math.SQRT2 - 40;
    return _$contrast < 7.5 ? 0.0 : _$contrast;
}
var contrastMethods = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    contrastAPCA: contrastAPCA,
    contrastDeltaPhi: contrastDeltaPhi,
    contrastLstar: contrastLstar,
    contrastMichelson: contrastMichelson,
    contrastWCAG21: contrastWCAG21,
    contrastWeber: contrastWeber
});
function contrast(background, foreground) {
    var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    if (isString(o)) {
        o = {
            algorithm: o
        };
    }
    var algorithm = o.algorithm, rest = _object_without_properties(o, [
        "algorithm"
    ]);
    if (!algorithm) {
        var algorithms = Object.keys(contrastMethods).map(function(a) {
            return a.replace(/^contrast/, "");
        }).join(", ");
        throw new TypeError("contrast() function needs a contrast algorithm. Please specify one of: ".concat(algorithms));
    }
    background = getColor(background);
    foreground = getColor(foreground);
    for(var a in contrastMethods){
        if ("contrast" + algorithm.toLowerCase() === a.toLowerCase()) {
            return contrastMethods[a](background, foreground, rest);
        }
    }
    throw new TypeError("Unknown contrast algorithm: ".concat(algorithm));
}
// Chromaticity coordinates
function uv(color) {
    var _getAll = _sliced_to_array(getAll(color, XYZ_D65), 3), X = _getAll[0], Y = _getAll[1], Z = _getAll[2];
    var denom = X + 15 * Y + 3 * Z;
    return [
        4 * X / denom,
        9 * Y / denom
    ];
}
function xy(color) {
    var _getAll = _sliced_to_array(getAll(color, XYZ_D65), 3), X = _getAll[0], Y = _getAll[1], Z = _getAll[2];
    var sum = X + Y + Z;
    return [
        X / sum,
        Y / sum
    ];
}
function register$1(Color) {
    // no setters, as lightness information is lost
    // when converting color to chromaticity
    Object.defineProperty(Color.prototype, "uv", {
        get: function get() {
            return uv(this);
        }
    });
    Object.defineProperty(Color.prototype, "xy", {
        get: function get() {
            return xy(this);
        }
    });
}
var chromaticity = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    register: register$1,
    uv: uv,
    xy: xy
});
function deltaE76(color, sample) {
    return distance(color, sample, "lab");
}
// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in Lab
// CMC by the Color Measurement Committee of the
// Bradford Society of Dyeists and Colorsts, 1994.
// Uses LCH rather than Lab,
// with different weights for L, C and H differences
// A nice increase in accuracy for modest increase in complexity
var π = Math.PI;
var d2r = π / 180;
function deltaECMC(color, sample) {
    var _ref = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {}, _ref_l = _ref.l, l = _ref_l === void 0 ? 2 : _ref_l, _ref_c = _ref.c, c = _ref_c === void 0 ? 1 : _ref_c;
    // Given this color as the reference
    // and a sample,
    // calculate deltaE CMC.
    // This implementation assumes the parametric
    // weighting factors l:c are 2:1
    // which is typical for non-textile uses.
    var _lab_from = _sliced_to_array(lab.from(color), 3), L1 = _lab_from[0], a1 = _lab_from[1], b1 = _lab_from[2];
    var _lch_from = _sliced_to_array(lch.from(lab, [
        L1,
        a1,
        b1
    ]), 3), C1 = _lch_from[1], H1 = _lch_from[2];
    var _lab_from1 = _sliced_to_array(lab.from(sample), 3), L2 = _lab_from1[0], a2 = _lab_from1[1], b2 = _lab_from1[2];
    var C2 = lch.from(lab, [
        L2,
        a2,
        b2
    ])[1];
    // let [L1, a1, b1] = color.getAll(lab);
    // let C1 = color.get("lch.c");
    // let H1 = color.get("lch.h");
    // let [L2, a2, b2] = sample.getAll(lab);
    // let C2 = sample.get("lch.c");
    // Check for negative Chroma,
    // which might happen through
    // direct user input of LCH values
    if (C1 < 0) {
        C1 = 0;
    }
    if (C2 < 0) {
        C2 = 0;
    }
    // we don't need H2 as ΔH is calculated from Δa, Δb and ΔC
    // Lightness and Chroma differences
    // These are (color - sample), unlike deltaE2000
    var ΔL = L1 - L2;
    var ΔC = C1 - C2;
    var Δa = a1 - a2;
    var Δb = b1 - b2;
    // weighted Hue difference, less for larger Chroma difference
    var H2 = Math.pow(Δa, 2) + Math.pow(Δb, 2) - Math.pow(ΔC, 2);
    // due to roundoff error it is possible that, for zero a and b,
    // ΔC > Δa + Δb is 0, resulting in attempting
    // to take the square root of a negative number
    // trying instead the equation from Industrial Color Physics
    // By Georg A. Klein
    // let ΔH = ((a1 * b2) - (a2 * b1)) / Math.sqrt(0.5 * ((C2 * C1) + (a2 * a1) + (b2 * b1)));
    // console.log({ΔH});
    // This gives the same result to 12 decimal places
    // except it sometimes NaNs when trying to root a negative number
    // let ΔH = Math.sqrt(H2); we never actually use the root, it gets squared again!!
    // positional corrections to the lack of uniformity of CIELAB
    // These are all trying to make JND ellipsoids more like spheres
    // SL Lightness crispening factor, depends entirely on L1 not L2
    var SL = 0.511; // linear portion of the Y to L transfer function
    if (L1 >= 16) {
        SL = 0.040975 * L1 / (1 + 0.01765 * L1);
    }
    // SC Chroma factor
    var SC = 0.0638 * C1 / (1 + 0.0131 * C1) + 0.638;
    // Cross term T for blue non-linearity
    var T;
    if (Number.isNaN(H1)) {
        H1 = 0;
    }
    if (H1 >= 164 && H1 <= 345) {
        T = 0.56 + Math.abs(0.2 * Math.cos((H1 + 168) * d2r));
    } else {
        T = 0.36 + Math.abs(0.4 * Math.cos((H1 + 35) * d2r));
    }
    // console.log({T});
    // SH Hue factor also depends on C1,
    var C4 = Math.pow(C1, 4);
    var F = Math.sqrt(C4 / (C4 + 1900));
    var SH = SC * (F * T + 1 - F);
    // Finally calculate the deltaE, term by term as root sume of squares
    var dE = Math.pow(ΔL / (l * SL), 2);
    dE += Math.pow(ΔC / (c * SC), 2);
    dE += H2 / Math.pow(SH, 2);
    // dE += (ΔH / SH)  ** 2;
    return Math.sqrt(dE);
// Yay!!!
}
var Yw$1 = 203; // absolute luminance of media white
var XYZ_Abs_D65 = new ColorSpace({
    // Absolute CIE XYZ, with a D65 whitepoint,
    // as used in most HDR colorspaces as a starting point.
    // SDR spaces are converted per BT.2048
    // so that diffuse, media white is 203 cd/m²
    id: "xyz-abs-d65",
    name: "Absolute XYZ D65",
    coords: {
        x: {
            refRange: [
                0,
                9504.7
            ],
            name: "Xa"
        },
        y: {
            refRange: [
                0,
                10000
            ],
            name: "Ya"
        },
        z: {
            refRange: [
                0,
                10888.3
            ],
            name: "Za"
        }
    },
    base: XYZ_D65,
    fromBase: function fromBase(XYZ) {
        // Make XYZ absolute, not relative to media white
        // Maximum luminance in PQ is 10,000 cd/m²
        // Relative XYZ has Y=1 for media white
        return XYZ.map(function(v) {
            return Math.max(v * Yw$1, 0);
        });
    },
    toBase: function toBase(AbsXYZ) {
        // Convert to media-white relative XYZ
        return AbsXYZ.map(function(v) {
            return Math.max(v / Yw$1, 0);
        });
    }
});
var b$1 = 1.15;
var g = 0.66;
var n$1 = 2610 / Math.pow(2, 14);
var ninv$1 = Math.pow(2, 14) / 2610;
var c1$2 = 3424 / Math.pow(2, 12);
var c2$2 = 2413 / Math.pow(2, 7);
var c3$2 = 2392 / Math.pow(2, 7);
var p = 1.7 * 2523 / Math.pow(2, 5);
var pinv = Math.pow(2, 5) / (1.7 * 2523);
var d = -0.56;
var d0 = 1.6295499532821566E-11;
var XYZtoCone_M = [
    [
        0.41478972,
        0.579999,
        0.0146480
    ],
    [
        -0.2015100,
        1.120649,
        0.0531008
    ],
    [
        -0.0166008,
        0.264800,
        0.6684799
    ]
];
// XYZtoCone_M inverted
var ConetoXYZ_M = [
    [
        1.9242264357876067,
        -1.0047923125953657,
        0.037651404030618
    ],
    [
        0.35031676209499907,
        0.7264811939316552,
        -0.06538442294808501
    ],
    [
        -0.09098281098284752,
        -0.3127282905230739,
        1.5227665613052603
    ]
];
var ConetoIab_M = [
    [
        0.5,
        0.5,
        0
    ],
    [
        3.524000,
        -4.066708,
        0.542708
    ],
    [
        0.199076,
        1.096799,
        -1.295875
    ]
];
// ConetoIab_M inverted
var IabtoCone_M = [
    [
        1,
        0.1386050432715393,
        0.05804731615611886
    ],
    [
        0.9999999999999999,
        -0.1386050432715393,
        -0.05804731615611886
    ],
    [
        0.9999999999999998,
        -0.09601924202631895,
        -0.8118918960560388
    ]
];
var Jzazbz = new ColorSpace({
    id: "jzazbz",
    name: "Jzazbz",
    coords: {
        jz: {
            refRange: [
                0,
                1
            ],
            name: "Jz"
        },
        az: {
            refRange: [
                -0.5,
                0.5
            ]
        },
        bz: {
            refRange: [
                -0.5,
                0.5
            ]
        }
    },
    base: XYZ_Abs_D65,
    fromBase: function fromBase(XYZ) {
        // First make XYZ absolute, not relative to media white
        // Maximum luminance in PQ is 10,000 cd/m²
        // Relative XYZ has Y=1 for media white
        // BT.2048 says media white Y=203 at PQ 58
        var _XYZ = _sliced_to_array(XYZ, 3), Xa = _XYZ[0], Ya = _XYZ[1], Za = _XYZ[2];
        // modify X and Y
        var Xm = b$1 * Xa - (b$1 - 1) * Za;
        var Ym = g * Ya - (g - 1) * Xa;
        // move to LMS cone domain
        var LMS = multiplyMatrices(XYZtoCone_M, [
            Xm,
            Ym,
            Za
        ]);
        // PQ-encode LMS
        var PQLMS = LMS.map(function(val) {
            var num = c1$2 + c2$2 * Math.pow(val / 10000, n$1);
            var denom = 1 + c3$2 * Math.pow(val / 10000, n$1);
            return Math.pow(num / denom, p);
        });
        // almost there, calculate Iz az bz
        var _multiplyMatrices = _sliced_to_array(multiplyMatrices(ConetoIab_M, PQLMS), 3), Iz = _multiplyMatrices[0], az = _multiplyMatrices[1], bz = _multiplyMatrices[2];
        // console.log({Iz, az, bz});
        var Jz = (1 + d) * Iz / (1 + d * Iz) - d0;
        return [
            Jz,
            az,
            bz
        ];
    },
    toBase: function toBase(Jzazbz) {
        var _Jzazbz = _sliced_to_array(Jzazbz, 3), Jz = _Jzazbz[0], az = _Jzazbz[1], bz = _Jzazbz[2];
        var Iz = (Jz + d0) / (1 + d - d * (Jz + d0));
        // bring into LMS cone domain
        var PQLMS = multiplyMatrices(IabtoCone_M, [
            Iz,
            az,
            bz
        ]);
        // convert from PQ-coded to linear-light
        var LMS = PQLMS.map(function(val) {
            var num = c1$2 - Math.pow(val, pinv);
            var denom = c3$2 * Math.pow(val, pinv) - c2$2;
            var x = 10000 * Math.pow(num / denom, ninv$1);
            return x; // luminance relative to diffuse white, [0, 70 or so].
        });
        // modified abs XYZ
        var _multiplyMatrices = _sliced_to_array(multiplyMatrices(ConetoXYZ_M, LMS), 3), Xm = _multiplyMatrices[0], Ym = _multiplyMatrices[1], Za = _multiplyMatrices[2];
        // restore standard D50 relative XYZ, relative to media white
        var Xa = (Xm + (b$1 - 1) * Za) / b$1;
        var Ya = (Ym + (g - 1) * Xa) / g;
        return [
            Xa,
            Ya,
            Za
        ];
    },
    formats: {
        // https://drafts.csswg.org/css-color-hdr/#Jzazbz
        "color": {}
    }
});
var jzczhz = new ColorSpace({
    id: "jzczhz",
    name: "JzCzHz",
    coords: {
        jz: {
            refRange: [
                0,
                1
            ],
            name: "Jz"
        },
        cz: {
            refRange: [
                0,
                1
            ],
            name: "Chroma"
        },
        hz: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        }
    },
    base: Jzazbz,
    fromBase: function fromBase(jzazbz) {
        // Convert to polar form
        var _jzazbz = _sliced_to_array(jzazbz, 3), Jz = _jzazbz[0], az = _jzazbz[1], bz = _jzazbz[2];
        var hue;
        var ε = 0.0002; // chromatic components much smaller than a,b
        if (Math.abs(az) < ε && Math.abs(bz) < ε) {
            hue = NaN;
        } else {
            hue = Math.atan2(bz, az) * 180 / Math.PI;
        }
        return [
            Jz,
            Math.sqrt(Math.pow(az, 2) + Math.pow(bz, 2)),
            constrain(hue) // Hue, in degrees [0 to 360)
        ];
    },
    toBase: function toBase(jzczhz) {
        // Convert from polar form
        // debugger;
        return [
            jzczhz[0],
            jzczhz[1] * Math.cos(jzczhz[2] * Math.PI / 180),
            jzczhz[1] * Math.sin(jzczhz[2] * Math.PI / 180) // bz
        ];
    },
    formats: {
        color: {}
    }
});
// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in Lab
// Uses JzCzHz, which has improved perceptual uniformity
// and thus a simple Euclidean root-sum of ΔL² ΔC² ΔH²
// gives good results.
function deltaEJz(color, sample) {
    // Given this color as the reference
    // and a sample,
    // calculate deltaE in JzCzHz.
    var _jzczhz_from = _sliced_to_array(jzczhz.from(color), 3), Jz1 = _jzczhz_from[0], Cz1 = _jzczhz_from[1], Hz1 = _jzczhz_from[2];
    var _jzczhz_from1 = _sliced_to_array(jzczhz.from(sample), 3), Jz2 = _jzczhz_from1[0], Cz2 = _jzczhz_from1[1], Hz2 = _jzczhz_from1[2];
    // Lightness and Chroma differences
    // sign does not matter as they are squared.
    var ΔJ = Jz1 - Jz2;
    var ΔC = Cz1 - Cz2;
    // length of chord for ΔH
    if (Number.isNaN(Hz1) && Number.isNaN(Hz2)) {
        // both undefined hues
        Hz1 = 0;
        Hz2 = 0;
    } else if (Number.isNaN(Hz1)) {
        // one undefined, set to the defined hue
        Hz1 = Hz2;
    } else if (Number.isNaN(Hz2)) {
        Hz2 = Hz1;
    }
    var Δh = Hz1 - Hz2;
    var ΔH = 2 * Math.sqrt(Cz1 * Cz2) * Math.sin(Δh / 2 * (Math.PI / 180));
    return Math.sqrt(Math.pow(ΔJ, 2) + Math.pow(ΔC, 2) + Math.pow(ΔH, 2));
}
var c1$1 = 3424 / 4096;
var c2$1 = 2413 / 128;
var c3$1 = 2392 / 128;
var m1 = 2610 / 16384;
var m2 = 2523 / 32;
var im1 = 16384 / 2610;
var im2 = 32 / 2523;
// The matrix below includes the 4% crosstalk components
// and is from the Dolby "What is ICtCp" paper"
var XYZtoLMS_M$1 = [
    [
        0.3592,
        0.6976,
        -0.0358
    ],
    [
        -0.1922,
        1.1004,
        0.0755
    ],
    [
        0.0070,
        0.0749,
        0.8434
    ]
];
// linear-light Rec.2020 to LMS, again with crosstalk
// rational terms from Jan Fröhlich,
// Encoding High Dynamic Range andWide Color Gamut Imagery, p.97
// and ITU-R BT.2124-0 p.2
/*
const Rec2020toLMS_M = [
	[ 1688 / 4096,  2146 / 4096,   262 / 4096 ],
	[  683 / 4096,  2951 / 4096,   462 / 4096 ],
	[   99 / 4096,   309 / 4096,  3688 / 4096 ]
];
*/ // this includes the Ebner LMS coefficients,
// the rotation, and the scaling to [-0.5,0.5] range
// rational terms from Fröhlich p.97
// and ITU-R BT.2124-0 pp.2-3
var LMStoIPT_M = [
    [
        2048 / 4096,
        2048 / 4096,
        0
    ],
    [
        6610 / 4096,
        -13613 / 4096,
        7003 / 4096
    ],
    [
        17933 / 4096,
        -17390 / 4096,
        -543 / 4096
    ]
];
// inverted matrices, calculated from the above
var IPTtoLMS_M = [
    [
        0.99998889656284013833,
        0.00860505014728705821,
        0.1110343715986164786
    ],
    [
        1.0000111034371598616,
        -0.00860505014728705821,
        -0.1110343715986164786
    ],
    [
        1.000032063391005412,
        0.56004913547279000113,
        -0.32063391005412026469
    ]
];
/*
const LMStoRec2020_M = [
	[ 3.4375568932814012112,   -2.5072112125095058195,   0.069654319228104608382],
	[-0.79142868665644156125,   1.9838372198740089874,  -0.19240853321756742626 ],
	[-0.025646662911506476363, -0.099240248643945566751, 1.1248869115554520431  ]
];
*/ var LMStoXYZ_M$1 = [
    [
        2.0701800566956135096,
        -1.3264568761030210255,
        0.20661600684785517081
    ],
    [
        0.36498825003265747974,
        0.68046736285223514102,
        -0.045421753075853231409
    ],
    [
        -0.049595542238932107896,
        -0.049421161186757487412,
        1.1879959417328034394
    ]
];
// Only the PQ form of ICtCp is implemented here. There is also an HLG form.
// from Dolby, "WHAT IS ICTCP?"
// https://professional.dolby.com/siteassets/pdfs/ictcp_dolbywhitepaper_v071.pdf
// and
// Dolby, "Perceptual Color Volume
// Measuring the Distinguishable Colors of HDR and WCG Displays"
// https://professional.dolby.com/siteassets/pdfs/dolby-vision-measuring-perceptual-color-volume-v7.1.pdf
var ictcp = new ColorSpace({
    id: "ictcp",
    name: "ICTCP",
    // From BT.2100-2 page 7:
    // During production, signal values are expected to exceed the
    // range E′ = [0.0 : 1.0]. This provides processing headroom and avoids
    // signal degradation during cascaded processing. Such values of E′,
    // below 0.0 or exceeding 1.0, should not be clipped during production
    // and exchange.
    // Values below 0.0 should not be clipped in reference displays (even
    // though they represent “negative” light) to allow the black level of
    // the signal (LB) to be properly set using test signals known as “PLUGE”
    coords: {
        i: {
            refRange: [
                0,
                1
            ],
            name: "I"
        },
        ct: {
            refRange: [
                -0.5,
                0.5
            ],
            name: "CT"
        },
        cp: {
            refRange: [
                -0.5,
                0.5
            ],
            name: "CP"
        }
    },
    base: XYZ_Abs_D65,
    fromBase: function fromBase(XYZ) {
        // move to LMS cone domain
        var LMS = multiplyMatrices(XYZtoLMS_M$1, XYZ);
        return LMStoICtCp(LMS);
    },
    toBase: function toBase(ICtCp) {
        var LMS = ICtCptoLMS(ICtCp);
        return multiplyMatrices(LMStoXYZ_M$1, LMS);
    },
    formats: {
        color: {}
    }
});
function LMStoICtCp(LMS) {
    // apply the PQ EOTF
    // we can't ever be dividing by zero because of the "1 +" in the denominator
    var PQLMS = LMS.map(function(val) {
        var num = c1$1 + c2$1 * Math.pow(val / 10000, m1);
        var denom = 1 + c3$1 * Math.pow(val / 10000, m1);
        return Math.pow(num / denom, m2);
    });
    // LMS to IPT, with rotation for Y'C'bC'r compatibility
    return multiplyMatrices(LMStoIPT_M, PQLMS);
}
function ICtCptoLMS(ICtCp) {
    var PQLMS = multiplyMatrices(IPTtoLMS_M, ICtCp);
    // From BT.2124-0 Annex 2 Conversion 3
    var LMS = PQLMS.map(function(val) {
        var num = Math.max(Math.pow(val, im2) - c1$1, 0);
        var denom = c2$1 - c3$1 * Math.pow(val, im2);
        return 10000 * Math.pow(num / denom, im1);
    });
    return LMS;
}
// Delta E in ICtCp space,
// which the ITU calls Delta E ITP, which is shorter
// formulae from ITU Rec. ITU-R BT.2124-0
function deltaEITP(color, sample) {
    // Given this color as the reference
    // and a sample,
    // calculate deltaE in ICtCp
    // which is simply the Euclidean distance
    var _ictcp_from = _sliced_to_array(ictcp.from(color), 3), I1 = _ictcp_from[0], T1 = _ictcp_from[1], P1 = _ictcp_from[2];
    var _ictcp_from1 = _sliced_to_array(ictcp.from(sample), 3), I2 = _ictcp_from1[0], T2 = _ictcp_from1[1], P2 = _ictcp_from1[2];
    // the 0.25 factor is to undo the encoding scaling in Ct
    // the 720 is so that 1 deltaE = 1 JND
    // per  ITU-R BT.2124-0 p.3
    return 720 * Math.sqrt(Math.pow(I1 - I2, 2) + 0.25 * Math.pow(T1 - T2, 2) + Math.pow(P1 - P2, 2));
}
// Recalculated for consistent reference white
// see https://github.com/w3c/csswg-drafts/issues/6642#issuecomment-943521484
var XYZtoLMS_M = [
    [
        0.8190224432164319,
        0.3619062562801221,
        -0.12887378261216414
    ],
    [
        0.0329836671980271,
        0.9292868468965546,
        0.03614466816999844
    ],
    [
        0.048177199566046255,
        0.26423952494422764,
        0.6335478258136937
    ]
];
// inverse of XYZtoLMS_M
var LMStoXYZ_M = [
    [
        1.2268798733741557,
        -0.5578149965554813,
        0.28139105017721583
    ],
    [
        -0.04057576262431372,
        1.1122868293970594,
        -0.07171106666151701
    ],
    [
        -0.07637294974672142,
        -0.4214933239627914,
        1.5869240244272418
    ]
];
var LMStoLab_M = [
    [
        0.2104542553,
        0.7936177850,
        -0.0040720468
    ],
    [
        1.9779984951,
        -2.4285922050,
        0.4505937099
    ],
    [
        0.0259040371,
        0.7827717662,
        -0.8086757660
    ]
];
// LMStoIab_M inverted
var LabtoLMS_M = [
    [
        0.99999999845051981432,
        0.39633779217376785678,
        0.21580375806075880339
    ],
    [
        1.0000000088817607767,
        -0.1055613423236563494,
        -0.063854174771705903402
    ],
    [
        1.0000000546724109177,
        -0.089484182094965759684,
        -1.2914855378640917399
    ]
];
var OKLab = new ColorSpace({
    id: "oklab",
    name: "Oklab",
    coords: {
        l: {
            refRange: [
                0,
                1
            ],
            name: "L"
        },
        a: {
            refRange: [
                -0.4,
                0.4
            ]
        },
        b: {
            refRange: [
                -0.4,
                0.4
            ]
        }
    },
    // Note that XYZ is relative to D65
    white: "D65",
    base: XYZ_D65,
    fromBase: function fromBase(XYZ) {
        // move to LMS cone domain
        var LMS = multiplyMatrices(XYZtoLMS_M, XYZ);
        // non-linearity
        var LMSg = LMS.map(function(val) {
            return Math.cbrt(val);
        });
        return multiplyMatrices(LMStoLab_M, LMSg);
    },
    toBase: function toBase(OKLab) {
        // move to LMS cone domain
        var LMSg = multiplyMatrices(LabtoLMS_M, OKLab);
        // restore linearity
        var LMS = LMSg.map(function(val) {
            return Math.pow(val, 3);
        });
        return multiplyMatrices(LMStoXYZ_M, LMS);
    },
    formats: {
        "oklab": {
            coords: [
                "<percentage> | <number>",
                "<number> | <percentage>[-1,1]",
                "<number> | <percentage>[-1,1]"
            ]
        }
    }
});
// More accurate color-difference formulae
// than the simple 1976 Euclidean distance in CIE Lab
function deltaEOK(color, sample) {
    // Given this color as the reference
    // and a sample,
    // calculate deltaEOK, term by term as root sum of squares
    var _OKLab_from = _sliced_to_array(OKLab.from(color), 3), L1 = _OKLab_from[0], a1 = _OKLab_from[1], b1 = _OKLab_from[2];
    var _OKLab_from1 = _sliced_to_array(OKLab.from(sample), 3), L2 = _OKLab_from1[0], a2 = _OKLab_from1[1], b2 = _OKLab_from1[2];
    var ΔL = L1 - L2;
    var Δa = a1 - a2;
    var Δb = b1 - b2;
    return Math.sqrt(Math.pow(ΔL, 2) + Math.pow(Δa, 2) + Math.pow(Δb, 2));
}
var deltaEMethods = {
    deltaE76: deltaE76,
    deltaECMC: deltaECMC,
    deltaE2000: deltaE2000,
    deltaEJz: deltaEJz,
    deltaEITP: deltaEITP,
    deltaEOK: deltaEOK
};
function deltaE(c1, c2) {
    var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    if (isString(o)) {
        o = {
            method: o
        };
    }
    var _o_method = o.method, method = _o_method === void 0 ? defaults.deltaE : _o_method, rest = _object_without_properties(o, [
        "method"
    ]);
    c1 = getColor(c1);
    c2 = getColor(c2);
    for(var m in deltaEMethods){
        if ("deltae" + method.toLowerCase() === m.toLowerCase()) {
            return deltaEMethods[m](c1, c2, rest);
        }
    }
    throw new TypeError("Unknown deltaE method: ".concat(method));
}
function lighten(color) {
    var amount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : .25;
    var space = ColorSpace.get("oklch", "lch");
    var lightness = [
        space,
        "l"
    ];
    return set(color, lightness, function(l) {
        return l * (1 + amount);
    });
}
function darken(color) {
    var amount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : .25;
    var space = ColorSpace.get("oklch", "lch");
    var lightness = [
        space,
        "l"
    ];
    return set(color, lightness, function(l) {
        return l * (1 - amount);
    });
}
var variations = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    darken: darken,
    lighten: lighten
});
/**
 * Functions related to color interpolation
 */ /**
 * Return an intermediate color between two colors
 * Signatures: mix(c1, c2, p, options)
 *             mix(c1, c2, options)
 *             mix(color)
 * @param {Color | string} c1 The first color
 * @param {Color | string} [c2] The second color
 * @param {number} [p=.5] A 0-1 percentage where 0 is c1 and 1 is c2
 * @param {Object} [o={}]
 * @return {Color}
 */ function mix(c1, c2) {
    var p = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : .5, o = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : {};
    var ref;
    ref = [
        getColor(c1),
        getColor(c2)
    ], c1 = ref[0], c2 = ref[1], ref;
    if (type(p) === "object") {
        var ref1;
        ref1 = [
            .5,
            p
        ], p = ref1[0], o = ref1[1], ref1;
    }
    var space = o.space, outputSpace = o.outputSpace, premultiplied = o.premultiplied;
    var r = range(c1, c2, {
        space: space,
        outputSpace: outputSpace,
        premultiplied: premultiplied
    });
    return r(p);
}
/**
 *
 * @param {Color | string | Function} c1 The first color or a range
 * @param {Color | string} [c2] The second color if c1 is not a range
 * @param {Object} [options={}]
 * @return {Color[]}
 */ function steps(c1, c2) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    var colorRange;
    if (isRange(c1)) {
        var ref;
        // Tweaking existing range
        ref = [
            c1,
            c2
        ], colorRange = ref[0], options = ref[1], ref;
        var ref1;
        ref1 = _sliced_to_array(colorRange.rangeArgs.colors, 2), c1 = ref1[0], c2 = ref1[1], ref1;
    }
    var maxDeltaE = options.maxDeltaE, deltaEMethod = options.deltaEMethod, _options_steps = options.steps, _$steps = _options_steps === void 0 ? 2 : _options_steps, _options_maxSteps = options.maxSteps, maxSteps = _options_maxSteps === void 0 ? 1000 : _options_maxSteps, rangeOptions = _object_without_properties(options, [
        "maxDeltaE",
        "deltaEMethod",
        "steps",
        "maxSteps"
    ]);
    if (!colorRange) {
        var ref2;
        ref2 = [
            getColor(c1),
            getColor(c2)
        ], c1 = ref2[0], c2 = ref2[1], ref2;
        colorRange = range(c1, c2, rangeOptions);
    }
    var totalDelta = deltaE(c1, c2);
    var actualSteps = maxDeltaE > 0 ? Math.max(_$steps, Math.ceil(totalDelta / maxDeltaE) + 1) : _$steps;
    var ret = [];
    if (maxSteps !== undefined) {
        actualSteps = Math.min(actualSteps, maxSteps);
    }
    if (actualSteps === 1) {
        ret = [
            {
                p: .5,
                color: colorRange(.5)
            }
        ];
    } else {
        var step = 1 / (actualSteps - 1);
        ret = Array.from({
            length: actualSteps
        }, function(_, i) {
            var p = i * step;
            return {
                p: p,
                color: colorRange(p)
            };
        });
    }
    if (maxDeltaE > 0) {
        // Iterate over all stops and find max deltaE
        var maxDelta = ret.reduce(function(acc, cur, i) {
            if (i === 0) {
                return 0;
            }
            var ΔΕ = deltaE(cur.color, ret[i - 1].color, deltaEMethod);
            return Math.max(acc, ΔΕ);
        }, 0);
        while(maxDelta > maxDeltaE){
            // Insert intermediate stops and measure maxDelta again
            // We need to do this for all pairs, otherwise the midpoint shifts
            maxDelta = 0;
            for(var i = 1; i < ret.length && ret.length < maxSteps; i++){
                var prev = ret[i - 1];
                var cur = ret[i];
                var p = (cur.p + prev.p) / 2;
                var color = colorRange(p);
                maxDelta = Math.max(maxDelta, deltaE(color, prev.color), deltaE(color, cur.color));
                ret.splice(i, 0, {
                    p: p,
                    color: colorRange(p)
                });
                i++;
            }
        }
    }
    ret = ret.map(function(a) {
        return a.color;
    });
    return ret;
}
/**
 * Interpolate to color2 and return a function that takes a 0-1 percentage
 * @param {Color | string | Function} color1 The first color or an existing range
 * @param {Color | string} [color2] If color1 is a color, this is the second color
 * @param {Object} [options={}]
 * @returns {Function} A function that takes a 0-1 percentage and returns a color
 */ function range(color1, color2) {
    var options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
    if (isRange(color1)) {
        // Tweaking existing range
        var _ref = [
            color1,
            color2
        ], r = _ref[0], options1 = _ref[1];
        return range.apply(void 0, _to_consumable_array(r.rangeArgs.colors).concat([
            _object_spread({}, r.rangeArgs.options, options1)
        ]));
    }
    var space = options.space, outputSpace = options.outputSpace, progression = options.progression, premultiplied = options.premultiplied;
    color1 = getColor(color1);
    color2 = getColor(color2);
    // Make sure we're working on copies of these colors
    color1 = clone(color1);
    color2 = clone(color2);
    var rangeArgs = {
        colors: [
            color1,
            color2
        ],
        options: options
    };
    if (space) {
        space = ColorSpace.get(space);
    } else {
        space = ColorSpace.registry[defaults.interpolationSpace] || color1.space;
    }
    outputSpace = outputSpace ? ColorSpace.get(outputSpace) : space;
    color1 = to(color1, space);
    color2 = to(color2, space);
    // Gamut map to avoid areas of flat color
    color1 = toGamut(color1);
    color2 = toGamut(color2);
    // Handle hue interpolation
    // See https://github.com/w3c/csswg-drafts/issues/4735#issuecomment-635741840
    if (space.coords.h && space.coords.h.type === "angle") {
        var arc = options.hue = options.hue || "shorter";
        var hue = [
            space,
            "h"
        ];
        var _ref1 = [
            get(color1, hue),
            get(color2, hue)
        ], θ1 = _ref1[0], θ2 = _ref1[1];
        var ref;
        ref = _sliced_to_array(adjust(arc, [
            θ1,
            θ2
        ]), 2), θ1 = ref[0], θ2 = ref[1], ref;
        set(color1, hue, θ1);
        set(color2, hue, θ2);
    }
    if (premultiplied) {
        // not coping with polar spaces yet
        color1.coords = color1.coords.map(function(c) {
            return c * color1.alpha;
        });
        color2.coords = color2.coords.map(function(c) {
            return c * color2.alpha;
        });
    }
    return Object.assign(function(p) {
        p = progression ? progression(p) : p;
        var coords = color1.coords.map(function(start, i) {
            var end = color2.coords[i];
            return interpolate(start, end, p);
        });
        var alpha = interpolate(color1.alpha, color2.alpha, p);
        var ret = {
            space: space,
            coords: coords,
            alpha: alpha
        };
        if (premultiplied) {
            // undo premultiplication
            ret.coords = ret.coords.map(function(c) {
                return c / alpha;
            });
        }
        if (outputSpace !== space) {
            ret = to(ret, outputSpace);
        }
        return ret;
    }, {
        rangeArgs: rangeArgs
    });
}
function isRange(val) {
    return type(val) === "function" && !!val.rangeArgs;
}
defaults.interpolationSpace = "lab";
function register(Color) {
    Color.defineFunction("mix", mix, {
        returns: "color"
    });
    Color.defineFunction("range", range, {
        returns: "function<color>"
    });
    Color.defineFunction("steps", steps, {
        returns: "array<color>"
    });
}
var interpolation = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    isRange: isRange,
    mix: mix,
    range: range,
    register: register,
    steps: steps
});
var HSL = new ColorSpace({
    id: "hsl",
    name: "HSL",
    coords: {
        h: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        },
        s: {
            range: [
                0,
                100
            ],
            name: "Saturation"
        },
        l: {
            range: [
                0,
                100
            ],
            name: "Lightness"
        }
    },
    base: sRGB,
    // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
    fromBase: function(rgb) {
        var _Math, _Math1;
        var max = (_Math = Math).max.apply(_Math, _to_consumable_array(rgb));
        var min = (_Math1 = Math).min.apply(_Math1, _to_consumable_array(rgb));
        var _rgb = _sliced_to_array(rgb, 3), r = _rgb[0], g = _rgb[1], b = _rgb[2];
        var _ref = [
            NaN,
            0,
            (min + max) / 2
        ], h = _ref[0], s = _ref[1], l = _ref[2];
        var d = max - min;
        if (d !== 0) {
            s = l === 0 || l === 1 ? 0 : (max - l) / Math.min(l, 1 - l);
            switch(max){
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
            }
            h = h * 60;
        }
        return [
            h,
            s * 100,
            l * 100
        ];
    },
    // Adapted from https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative
    toBase: function(hsl) {
        var f = function f(n) {
            var k = (n + h / 30) % 12;
            var a = s * Math.min(l, 1 - l);
            return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        };
        var _hsl = _sliced_to_array(hsl, 3), h = _hsl[0], s = _hsl[1], l = _hsl[2];
        h = h % 360;
        if (h < 0) {
            h += 360;
        }
        s /= 100;
        l /= 100;
        return [
            f(0),
            f(8),
            f(4)
        ];
    },
    formats: {
        "hsl": {
            toGamut: true,
            coords: [
                "<number> | <angle>",
                "<percentage>",
                "<percentage>"
            ]
        },
        "hsla": {
            coords: [
                "<number> | <angle>",
                "<percentage>",
                "<percentage>"
            ],
            commas: true,
            lastAlpha: true
        }
    }
});
// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.
var HSV = new ColorSpace({
    id: "hsv",
    name: "HSV",
    coords: {
        h: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        },
        s: {
            range: [
                0,
                100
            ],
            name: "Saturation"
        },
        v: {
            range: [
                0,
                100
            ],
            name: "Value"
        }
    },
    base: HSL,
    // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
    fromBase: function fromBase(hsl) {
        var _hsl = _sliced_to_array(hsl, 3), h = _hsl[0], s = _hsl[1], l = _hsl[2];
        s /= 100;
        l /= 100;
        var v = l + s * Math.min(l, 1 - l);
        return [
            h,
            v === 0 ? 0 : 200 * (1 - l / v),
            100 * v
        ];
    },
    // https://en.wikipedia.org/wiki/HSL_and_HSV#Interconversion
    toBase: function toBase(hsv) {
        var _hsv = _sliced_to_array(hsv, 3), h = _hsv[0], s = _hsv[1], v = _hsv[2];
        s /= 100;
        v /= 100;
        var l = v * (1 - s / 2);
        return [
            h,
            l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l) * 100,
            l * 100
        ];
    },
    formats: {
        color: {
            toGamut: true
        }
    }
});
// The Hue, Whiteness Blackness (HWB) colorspace
// See https://drafts.csswg.org/css-color-4/#the-hwb-notation
// Note that, like HSL, calculations are done directly on
// gamma-corrected sRGB values rather than linearising them first.
var hwb = new ColorSpace({
    id: "hwb",
    name: "HWB",
    coords: {
        h: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        },
        w: {
            range: [
                0,
                100
            ],
            name: "Whiteness"
        },
        b: {
            range: [
                0,
                100
            ],
            name: "Blackness"
        }
    },
    base: HSV,
    fromBase: function fromBase(hsv) {
        var _hsv = _sliced_to_array(hsv, 3), h = _hsv[0], s = _hsv[1], v = _hsv[2];
        return [
            h,
            v * (100 - s) / 100,
            100 - v
        ];
    },
    toBase: function toBase(hwb) {
        var _hwb = _sliced_to_array(hwb, 3), h = _hwb[0], w = _hwb[1], b = _hwb[2];
        // Now convert percentages to [0..1]
        w /= 100;
        b /= 100;
        // Achromatic check (white plus black >= 1)
        var sum = w + b;
        if (sum >= 1) {
            var gray = w / sum;
            return [
                h,
                0,
                gray * 100
            ];
        }
        var v = 1 - b;
        var s = v === 0 ? 0 : 1 - w / v;
        return [
            h,
            s * 100,
            v * 100
        ];
    },
    formats: {
        "hwb": {
            toGamut: true,
            coords: [
                "<number> | <angle>",
                "<percentage>",
                "<percentage>"
            ]
        }
    }
});
// convert an array of linear-light a98-rgb values to CIE XYZ
// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
// has greater numerical precision than section 4.3.5.3 of
// https://www.adobe.com/digitalimag/pdfs/AdobeRGB1998.pdf
// but the values below were calculated from first principles
// from the chromaticity coordinates of R G B W
var toXYZ_M$2 = [
    [
        0.5766690429101305,
        0.1855582379065463,
        0.1882286462349947
    ],
    [
        0.29734497525053605,
        0.6273635662554661,
        0.07529145849399788
    ],
    [
        0.02703136138641234,
        0.07068885253582723,
        0.9913375368376388
    ]
];
var fromXYZ_M$2 = [
    [
        2.0415879038107465,
        -0.5650069742788596,
        -0.34473135077832956
    ],
    [
        -0.9692436362808795,
        1.8759675015077202,
        0.04155505740717557
    ],
    [
        0.013444280632031142,
        -0.11836239223101838,
        1.0151749943912054
    ]
];
var A98Linear = new RGBColorSpace({
    id: "a98rgb-linear",
    name: "Linear Adobe\xae 98 RGB compatible",
    white: "D65",
    toXYZ_M: toXYZ_M$2,
    fromXYZ_M: fromXYZ_M$2
});
var a98rgb = new RGBColorSpace({
    id: "a98rgb",
    name: "Adobe\xae 98 RGB compatible",
    base: A98Linear,
    toBase: function(RGB) {
        return RGB.map(function(val) {
            return Math.pow(Math.abs(val), 563 / 256) * Math.sign(val);
        });
    },
    fromBase: function(RGB) {
        return RGB.map(function(val) {
            return Math.pow(Math.abs(val), 256 / 563) * Math.sign(val);
        });
    },
    formats: {
        color: {
            id: "a98-rgb"
        }
    }
});
// convert an array of  prophoto-rgb values to CIE XYZ
// using  D50 (so no chromatic adaptation needed afterwards)
// http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
var toXYZ_M$1 = [
    [
        0.7977604896723027,
        0.13518583717574031,
        0.0313493495815248
    ],
    [
        0.2880711282292934,
        0.7118432178101014,
        0.00008565396060525902
    ],
    [
        0.0,
        0.0,
        0.8251046025104601
    ]
];
var fromXYZ_M$1 = [
    [
        1.3457989731028281,
        -0.25558010007997534,
        -0.05110628506753401
    ],
    [
        -0.5446224939028347,
        1.5082327413132781,
        0.02053603239147973
    ],
    [
        0.0,
        0.0,
        1.2119675456389454
    ]
];
var ProPhotoLinear = new RGBColorSpace({
    id: "prophoto-linear",
    name: "Linear ProPhoto",
    white: "D50",
    base: XYZ_D50,
    toXYZ_M: toXYZ_M$1,
    fromXYZ_M: fromXYZ_M$1
});
var Et = 1 / 512;
var Et2 = 16 / 512;
var prophoto = new RGBColorSpace({
    id: "prophoto",
    name: "ProPhoto",
    base: ProPhotoLinear,
    toBase: function toBase(RGB) {
        // Transfer curve is gamma 1.8 with a small linear portion
        return RGB.map(function(v) {
            return v < Et2 ? v / 16 : Math.pow(v, 1.8);
        });
    },
    fromBase: function fromBase(RGB) {
        return RGB.map(function(v) {
            return v >= Et ? Math.pow(v, 1 / 1.8) : 16 * v;
        });
    },
    formats: {
        color: {
            id: "prophoto-rgb"
        }
    }
});
var oklch = new ColorSpace({
    id: "oklch",
    name: "Oklch",
    coords: {
        l: {
            refRange: [
                0,
                1
            ],
            name: "Lightness"
        },
        c: {
            refRange: [
                0,
                0.4
            ],
            name: "Chroma"
        },
        h: {
            refRange: [
                0,
                360
            ],
            type: "angle",
            name: "Hue"
        }
    },
    white: "D65",
    base: OKLab,
    fromBase: function fromBase(oklab) {
        // Convert to polar form
        var _oklab = _sliced_to_array(oklab, 3), L = _oklab[0], a = _oklab[1], b = _oklab[2];
        var h;
        var ε = 0.0002; // chromatic components much smaller than a,b
        if (Math.abs(a) < ε && Math.abs(b) < ε) {
            h = NaN;
        } else {
            h = Math.atan2(b, a) * 180 / Math.PI;
        }
        return [
            L,
            Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)),
            constrain(h) // Hue, in degrees [0 to 360)
        ];
    },
    // Convert from polar form
    toBase: function toBase(oklch) {
        var _oklch = _sliced_to_array(oklch, 3), L = _oklch[0], C = _oklch[1], h = _oklch[2];
        var a, b;
        // check for NaN hue
        if (isNaN(h)) {
            a = 0;
            b = 0;
        } else {
            a = C * Math.cos(h * Math.PI / 180);
            b = C * Math.sin(h * Math.PI / 180);
        }
        return [
            L,
            a,
            b
        ];
    },
    formats: {
        "oklch": {
            coords: [
                "<number> | <percentage>",
                "<number> | <percentage>[0,1]",
                "<number> | <angle>"
            ]
        }
    }
});
var Yw = 203; // absolute luminance of media white, cd/m²
var n = 2610 / Math.pow(2, 14);
var ninv = Math.pow(2, 14) / 2610;
var m = 2523 / Math.pow(2, 5);
var minv = Math.pow(2, 5) / 2523;
var c1 = 3424 / Math.pow(2, 12);
var c2 = 2413 / Math.pow(2, 7);
var c3 = 2392 / Math.pow(2, 7);
var rec2100Pq = new RGBColorSpace({
    id: "rec2100pq",
    name: "REC.2100-PQ",
    base: REC2020Linear,
    toBase: function toBase(RGB) {
        // given PQ encoded component in range [0, 1]
        // return media-white relative linear-light
        return RGB.map(function(val) {
            var x = Math.pow(Math.max(Math.pow(val, minv) - c1, 0) / (c2 - c3 * Math.pow(val, minv)), ninv);
            return x * 10000 / Yw; // luminance relative to diffuse white, [0, 70 or so].
        });
    },
    fromBase: function fromBase(RGB) {
        // given media-white relative linear-light
        // returnPQ encoded component in range [0, 1]
        return RGB.map(function(val) {
            var x = Math.max(val * Yw / 10000, 0); // absolute luminance of peak white is 10,000 cd/m².
            var num = c1 + c2 * Math.pow(x, n);
            var denom = 1 + c3 * Math.pow(x, n);
            return Math.pow(num / denom, m);
        });
    },
    formats: {
        color: {
            id: "rec2100-pq"
        }
    }
});
// FIXME see https://github.com/LeaVerou/color.js/issues/190
var a = 0.17883277;
var b = 0.28466892; // 1 - (4 * a)
var c = 0.55991073; // 0.5 - a * Math.log(4 *a)
var scale = 3.7743; // Place 18% grey at HLG 0.38, so media white at 0.75
var rec2100Hlg = new RGBColorSpace({
    id: "rec2100hlg",
    cssid: "rec2100-hlg",
    name: "REC.2100-HLG",
    referred: "scene",
    base: REC2020Linear,
    toBase: function toBase(RGB) {
        // given HLG encoded component in range [0, 1]
        // return media-white relative linear-light
        return RGB.map(function(val) {
            // first the HLG EOTF
            // ITU-R BT.2390-10 p.30 section
            // 6.3 The hybrid log-gamma electro-optical transfer function (EOTF)
            // Then scale by 3 so media white is 1.0
            if (val <= 0.5) {
                return Math.pow(val, 2) / 3 * scale;
            }
            return (Math.exp((val - c) / a) + b) / 12 * scale;
        });
    },
    fromBase: function fromBase(RGB) {
        // given media-white relative linear-light
        // where diffuse white is 1.0,
        // return HLG encoded component in range [0, 1]
        return RGB.map(function(val) {
            // first scale to put linear-light media white at 1/3
            val /= scale;
            // now the HLG OETF
            // ITU-R BT.2390-10 p.23
            // 6.1 The hybrid log-gamma opto-electronic transfer function (OETF)
            if (val <= 1 / 12) {
                return Math.sqrt(3 * val);
            }
            return a * Math.log(12 * val - b) + c;
        });
    },
    formats: {
        color: {
            id: "rec2100-hlg"
        }
    }
});
var CATs = {};
hooks.add("chromatic-adaptation-start", function(env) {
    if (env.options.method) {
        env.M = adapt(env.W1, env.W2, env.options.method);
    }
});
hooks.add("chromatic-adaptation-end", function(env) {
    if (!env.M) {
        env.M = adapt(env.W1, env.W2, env.options.method);
    }
});
function defineCAT(param) {
    var id = param.id, toCone_M = param.toCone_M, fromCone_M = param.fromCone_M;
    // Use id, toCone_M, fromCone_M like variables
    CATs[id] = arguments[0];
}
function adapt(W1, W2) {
    var id = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "Bradford";
    // adapt from a source whitepoint or illuminant W1
    // to a destination whitepoint or illuminant W2,
    // using the given chromatic adaptation transform (CAT)
    // debugger;
    var method = CATs[id];
    var _multiplyMatrices = _sliced_to_array(multiplyMatrices(method.toCone_M, W1), 3), ρs = _multiplyMatrices[0], γs = _multiplyMatrices[1], βs = _multiplyMatrices[2];
    var _multiplyMatrices1 = _sliced_to_array(multiplyMatrices(method.toCone_M, W2), 3), ρd = _multiplyMatrices1[0], γd = _multiplyMatrices1[1], βd = _multiplyMatrices1[2];
    // all practical illuminants have non-zero XYZ so no division by zero can occur below
    var scale = [
        [
            ρd / ρs,
            0,
            0
        ],
        [
            0,
            γd / γs,
            0
        ],
        [
            0,
            0,
            βd / βs
        ]
    ];
    // console.log({scale});
    var scaled_cone_M = multiplyMatrices(scale, method.toCone_M);
    var adapt_M = multiplyMatrices(method.fromCone_M, scaled_cone_M);
    // console.log({scaled_cone_M, adapt_M});
    return adapt_M;
}
defineCAT({
    id: "von Kries",
    toCone_M: [
        [
            0.4002400,
            0.7076000,
            -0.0808100
        ],
        [
            -0.2263000,
            1.1653200,
            0.0457000
        ],
        [
            0.0000000,
            0.0000000,
            0.9182200
        ]
    ],
    fromCone_M: [
        [
            1.8599364,
            -1.1293816,
            0.2198974
        ],
        [
            0.3611914,
            0.6388125,
            -0.0000064
        ],
        [
            0.0000000,
            0.0000000,
            1.0890636
        ]
    ]
});
defineCAT({
    id: "Bradford",
    // Convert an array of XYZ values in the range 0.0 - 1.0
    // to cone fundamentals
    toCone_M: [
        [
            0.8951000,
            0.2664000,
            -0.1614000
        ],
        [
            -0.7502000,
            1.7135000,
            0.0367000
        ],
        [
            0.0389000,
            -0.0685000,
            1.0296000
        ]
    ],
    // and back
    fromCone_M: [
        [
            0.9869929,
            -0.1470543,
            0.1599627
        ],
        [
            0.4323053,
            0.5183603,
            0.0492912
        ],
        [
            -0.0085287,
            0.0400428,
            0.9684867
        ]
    ]
});
defineCAT({
    id: "CAT02",
    // with complete chromatic adaptation to W2, so D = 1.0
    toCone_M: [
        [
            0.7328000,
            0.4296000,
            -0.1624000
        ],
        [
            -0.7036000,
            1.6975000,
            0.0061000
        ],
        [
            0.0030000,
            0.0136000,
            0.9834000
        ]
    ],
    fromCone_M: [
        [
            1.0961238,
            -0.2788690,
            0.1827452
        ],
        [
            0.4543690,
            0.4735332,
            0.0720978
        ],
        [
            -0.0096276,
            -0.0056980,
            1.0153256
        ]
    ]
});
defineCAT({
    id: "CAT16",
    toCone_M: [
        [
            0.401288,
            0.650173,
            -0.051461
        ],
        [
            -0.250268,
            1.204414,
            0.045854
        ],
        [
            -0.002079,
            0.048952,
            0.953127
        ]
    ],
    // the extra precision is needed to avoid roundtripping errors
    fromCone_M: [
        [
            1.862067855087233e+0,
            -1.011254630531685e+0,
            1.491867754444518e-1
        ],
        [
            3.875265432361372e-1,
            6.214474419314753e-1,
            -8.973985167612518e-3
        ],
        [
            -1.584149884933386e-2,
            -3.412293802851557e-2,
            1.049964436877850e+0
        ]
    ]
});
Object.assign(WHITES, {
    // whitepoint values from ASTM E308-01 with 10nm spacing, 1931 2 degree observer
    // all normalized to Y (luminance) = 1.00000
    // Illuminant A is a tungsten electric light, giving a very warm, orange light.
    A: [
        1.09850,
        1.00000,
        0.35585
    ],
    // Illuminant C was an early approximation to daylight: illuminant A with a blue filter.
    C: [
        0.98074,
        1.000000,
        1.18232
    ],
    // The daylight series of illuminants simulate natural daylight.
    // The color temperature (in degrees Kelvin/100) ranges from
    // cool, overcast daylight (D50) to bright, direct sunlight (D65).
    D55: [
        0.95682,
        1.00000,
        0.92149
    ],
    D75: [
        0.94972,
        1.00000,
        1.22638
    ],
    // Equal-energy illuminant, used in two-stage CAT16
    E: [
        1.00000,
        1.00000,
        1.00000
    ],
    // The F series of illuminants represent fluorescent lights
    F2: [
        0.99186,
        1.00000,
        0.67393
    ],
    F7: [
        0.95041,
        1.00000,
        1.08747
    ],
    F11: [
        1.00962,
        1.00000,
        0.64350
    ]
});
// The ACES whitepoint
// see TB-2018-001 Derivation of the ACES White Point CIE Chromaticity Coordinates
// also https://github.com/ampas/aces-dev/blob/master/documents/python/TB-2018-001/aces_wp.py
// Similar to D60
WHITES.ACES = [
    0.32168 / 0.33767,
    1.00000,
    (1.00000 - 0.32168 - 0.33767) / 0.33767
];
// convert an array of linear-light ACEScc values to CIE XYZ
var toXYZ_M = [
    [
        0.6624541811085053,
        0.13400420645643313,
        0.1561876870049078
    ],
    [
        0.27222871678091454,
        0.6740817658111484,
        0.05368951740793705
    ],
    [
        -0.005574649490394108,
        0.004060733528982826,
        1.0103391003129971
    ]
];
var fromXYZ_M = [
    [
        1.6410233796943257,
        -0.32480329418479,
        -0.23642469523761225
    ],
    [
        -0.6636628587229829,
        1.6153315916573379,
        0.016756347685530137
    ],
    [
        0.011721894328375376,
        -0.008284441996237409,
        0.9883948585390215
    ]
];
var ACEScg = new RGBColorSpace({
    id: "acescg",
    name: "ACEScg",
    // ACEScg – A scene-referred, linear-light encoding of ACES Data
    // https://docs.acescentral.com/specifications/acescg/
    // uses the AP1 primaries, see section 4.3.1 Color primaries
    coords: {
        r: {
            range: [
                0,
                65504
            ],
            name: "Red"
        },
        g: {
            range: [
                0,
                65504
            ],
            name: "Green"
        },
        b: {
            range: [
                0,
                65504
            ],
            name: "Blue"
        }
    },
    referred: "scene",
    white: WHITES.ACES,
    toXYZ_M: toXYZ_M,
    fromXYZ_M: fromXYZ_M,
    formats: {
        color: {}
    }
});
// export default Color;
var ε = Math.pow(2, -16);
// the smallest value which, in the 32bit IEEE 754 float encoding,
// decodes as a non-negative value
var ACES_min_nonzero = -0.35828683;
// brightest encoded value, decodes to 65504
var ACES_cc_max = (Math.log2(65504) + 9.72) / 17.52; // 1.468
var acescc = new RGBColorSpace({
    id: "acescc",
    name: "ACEScc",
    // see S-2014-003 ACEScc – A Logarithmic Encoding of ACES Data
    // https://docs.acescentral.com/specifications/acescc/
    // uses the AP1 primaries, see section 4.3.1 Color primaries
    // Appendix A: "Very small ACES scene referred values below 7 1/4 stops
    // below 18% middle gray are encoded as negative ACEScc values.
    // These values should be preserved per the encoding in Section 4.4
    // so that all positive ACES values are maintained."
    coords: {
        r: {
            range: [
                ACES_min_nonzero,
                ACES_cc_max
            ],
            name: "Red"
        },
        g: {
            range: [
                ACES_min_nonzero,
                ACES_cc_max
            ],
            name: "Green"
        },
        b: {
            range: [
                ACES_min_nonzero,
                ACES_cc_max
            ],
            name: "Blue"
        }
    },
    referred: "scene",
    base: ACEScg,
    // from section 4.4.2 Decoding Function
    toBase: function toBase(RGB) {
        var low = (9.72 - 15) / 17.52; // -0.3014
        return RGB.map(function(val) {
            if (val <= low) {
                return (Math.pow(2, val * 17.52 - 9.72) - ε) * 2; // very low values, below -0.3014
            } else if (val < ACES_cc_max) {
                return Math.pow(2, val * 17.52 - 9.72);
            } else {
                return 65504;
            }
        });
    },
    // Non-linear encoding function from S-2014-003, section 4.4.1 Encoding Function
    fromBase: function fromBase(RGB) {
        return RGB.map(function(val) {
            if (val <= 0) {
                return (Math.log2(ε) + 9.72) / 17.52; // -0.3584
            } else if (val < ε) {
                return (Math.log2(ε + val * 0.5) + 9.72) / 17.52;
            } else {
                return (Math.log2(val) + 9.72) / 17.52;
            }
        });
    },
    // encoded media white (rgb 1,1,1) => linear  [ 222.861, 222.861, 222.861 ]
    // encoded media black (rgb 0,0,0) => linear [ 0.0011857, 0.0011857, 0.0011857]
    formats: {
        color: {}
    }
});
var spaces = /*#__PURE__*/ Object.freeze({
    __proto__: null,
    A98RGB: a98rgb,
    A98RGB_Linear: A98Linear,
    ACEScc: acescc,
    ACEScg: ACEScg,
    HSL: HSL,
    HSV: HSV,
    HWB: hwb,
    ICTCP: ictcp,
    JzCzHz: jzczhz,
    Jzazbz: Jzazbz,
    LCH: lch,
    Lab: lab,
    Lab_D65: lab_d65,
    OKLCH: oklch,
    OKLab: OKLab,
    P3: P3,
    P3_Linear: P3Linear,
    ProPhoto: prophoto,
    ProPhoto_Linear: ProPhotoLinear,
    REC_2020: REC2020,
    REC_2020_Linear: REC2020Linear,
    REC_2100_HLG: rec2100Hlg,
    REC_2100_PQ: rec2100Pq,
    XYZ_ABS_D65: XYZ_Abs_D65,
    XYZ_D50: XYZ_D50,
    XYZ_D65: XYZ_D65,
    sRGB: sRGB,
    sRGB_Linear: sRGBLinear
});
/**
 * Class that represents a color
 */ var Color = /*#__PURE__*/ function() {
    "use strict";
    function Color() {
        var _this = this, _loop = function(id) {
            Object.defineProperty(_this, id, {
                get: function() {
                    return _this1.get(id);
                },
                set: function(value) {
                    return _this1.set(id, value);
                }
            });
        };
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        var _this1 = this;
        _class_call_check(this, Color);
        var color;
        if (args.length === 1) {
            color = getColor(args[0]);
        }
        var space, coords, alpha;
        if (color) {
            space = color.space || color.spaceId;
            coords = color.coords;
            alpha = color.alpha;
        } else {
            var ref;
            // default signature new Color(ColorSpace, array [, alpha])
            ref = _sliced_to_array(args, 3), space = ref[0], coords = ref[1], alpha = ref[2], ref;
        }
        Object.defineProperty(this, "space", {
            value: ColorSpace.get(space),
            writable: false,
            enumerable: true,
            configurable: true
        });
        this.coords = coords ? coords.slice() : [
            0,
            0,
            0
        ];
        this.alpha = alpha < 1 ? alpha : 1; // this also deals with NaN etc
        // Convert "NaN" to NaN
        for(var i = 0; i < this.coords.length; i++){
            if (this.coords[i] === "NaN") {
                this.coords[i] = NaN;
            }
        }
        // Define getters and setters for each coordinate
        for(var id in this.space.coords)_loop(id);
    }
    _create_class(Color, [
        {
            key: "spaceId",
            get: function get() {
                return this.space.id;
            }
        },
        {
            key: "clone",
            value: function clone() {
                return new Color(this.space, this.coords, this.alpha);
            }
        },
        {
            key: "toJSON",
            value: function toJSON() {
                return {
                    spaceId: this.spaceId,
                    coords: this.coords,
                    alpha: this.alpha
                };
            }
        },
        {
            key: "display",
            value: function display1() {
                for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                    args[_key] = arguments[_key];
                }
                var ret = display.apply(void 0, [
                    this
                ].concat(_to_consumable_array(args)));
                // Convert color object to Color instance
                ret.color = new Color(ret.color);
                return ret;
            }
        }
    ], [
        {
            key: "get",
            value: /**
	 * Get a color from the argument passed
	 * Basically gets us the same result as new Color(color) but doesn't clone an existing color object
	 */ function get(color) {
                for(var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                    args[_key - 1] = arguments[_key];
                }
                if (_instanceof(color, Color)) {
                    return color;
                }
                return _construct(Color, [
                    color
                ].concat(_to_consumable_array(args)));
            }
        },
        {
            key: "defineFunction",
            value: function defineFunction(name, code) {
                var o = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : code;
                var _o_instance = o.instance, instance = _o_instance === void 0 ? true : _o_instance, returns = o.returns;
                var func = function func() {
                    for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                        args[_key] = arguments[_key];
                    }
                    var ret = code.apply(void 0, _to_consumable_array(args));
                    if (returns === "color") {
                        ret = Color.get(ret);
                    } else if (returns === "function<color>") {
                        var f = ret;
                        ret = function ret() {
                            for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                                args[_key] = arguments[_key];
                            }
                            var ret = f.apply(void 0, _to_consumable_array(args));
                            return Color.get(ret);
                        };
                        // Copy any function metadata
                        Object.assign(ret, f);
                    } else if (returns === "array<color>") {
                        ret = ret.map(function(c) {
                            return Color.get(c);
                        });
                    }
                    return ret;
                };
                if (!(name in Color)) {
                    Color[name] = func;
                }
                if (instance) {
                    Color.prototype[name] = function() {
                        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
                            args[_key] = arguments[_key];
                        }
                        return func.apply(void 0, [
                            this
                        ].concat(_to_consumable_array(args)));
                    };
                }
            }
        },
        {
            key: "defineFunctions",
            value: function defineFunctions(o) {
                for(var name in o){
                    Color.defineFunction(name, o[name], o[name]);
                }
            }
        },
        {
            key: "extend",
            value: function extend(exports) {
                if (exports.register) {
                    exports.register(Color);
                } else {
                    // No register method, just add the module's functions
                    for(var name in exports){
                        Color.defineFunction(name, exports[name]);
                    }
                }
            }
        }
    ]);
    return Color;
}();
Color.defineFunctions({
    get: get,
    getAll: getAll,
    set: set,
    setAll: setAll,
    to: to,
    equals: equals,
    inGamut: inGamut,
    toGamut: toGamut,
    distance: distance,
    toString: serialize
});
Object.assign(Color, {
    util: util,
    hooks: hooks,
    WHITES: WHITES,
    Space: ColorSpace,
    spaces: ColorSpace.registry,
    parse: parse,
    // Global defaults one may want to configure
    defaults: defaults
});
var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
try {
    for(var _iterator = Object.keys(spaces)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true){
        var key = _step.value;
        ColorSpace.register(spaces[key]);
    }
} catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
} finally{
    try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
        }
    } finally{
        if (_didIteratorError) {
            throw _iteratorError;
        }
    }
}
/**
 * This plugin defines getters and setters for color[spaceId]
 * e.g. color.lch on *any* color gives us the lch coords
 */ // Add space accessors to existing color spaces
for(var id in ColorSpace.registry){
    addSpaceAccessors(id, ColorSpace.registry[id]);
}
// Add space accessors to color spaces not yet created
hooks.add("colorspace-init-end", function(space) {
    var _space_aliases;
    addSpaceAccessors(space.id, space);
    (_space_aliases = space.aliases) === null || _space_aliases === void 0 ? void 0 : _space_aliases.forEach(function(alias) {
        addSpaceAccessors(alias, space);
    });
});
function addSpaceAccessors(id, space) {
    // Coordinates can be looked up by both id and name
    Object.keys(space.coords);
    Object.values(space.coords).map(function(c) {
        return c.name;
    });
    var propId = id.replace(/-/g, "_");
    Object.defineProperty(Color.prototype, propId, {
        // Convert coords to coords in another colorspace and return them
        // Source colorspace: this.spaceId
        // Target colorspace: id
        get: function get() {
            var _this = this;
            var ret = this.getAll(id);
            if (typeof Proxy === "undefined") {
                // If proxies are not supported, just return a static array
                return ret;
            }
            // Enable color.spaceId.coordName syntax
            return new Proxy(ret, {
                has: function(obj, property) {
                    try {
                        ColorSpace.resolveCoord([
                            space,
                            property
                        ]);
                        return true;
                    } catch (e) {}
                    return Reflect.has(obj, property);
                },
                get: function(obj, property, receiver) {
                    if (property && (typeof property === "undefined" ? "undefined" : _type_of(property)) !== "symbol" && !(property in obj)) {
                        var index = ColorSpace.resolveCoord([
                            space,
                            property
                        ]).index;
                        if (index >= 0) {
                            return obj[index];
                        }
                    }
                    return Reflect.get(obj, property, receiver);
                },
                set: function(obj, property, value, receiver) {
                    if (property && (typeof property === "undefined" ? "undefined" : _type_of(property)) !== "symbol" && !(property in obj) || property >= 0) {
                        var index = ColorSpace.resolveCoord([
                            space,
                            property
                        ]).index;
                        if (index >= 0) {
                            obj[index] = value;
                            // Update color.coords
                            _this.setAll(id, obj);
                            return true;
                        }
                    }
                    return Reflect.set(obj, property, value, receiver);
                }
            });
        },
        // Convert coords in another colorspace to internal coords and set them
        // Target colorspace: this.spaceId
        // Source colorspace: id
        set: function set(coords) {
            this.setAll(id, coords);
        },
        configurable: true,
        enumerable: true
    });
}
// Import all modules of Color.js
Color.extend(deltaEMethods);
Color.extend({
    deltaE: deltaE
});
Object.assign(Color, {
    deltaEMethods: deltaEMethods
});
Color.extend(variations);
Color.extend({
    contrast: contrast
});
Color.extend(chromaticity);
Color.extend(luminance);
Color.extend(interpolation);
Color.extend(contrastMethods);
 //# sourceMappingURL=color.js.map


/***/ }),

/***/ "./node_modules/js-yaml/dist/js-yaml.mjs":
/*!***********************************************!*\
  !*** ./node_modules/js-yaml/dist/js-yaml.mjs ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CORE_SCHEMA: () => (/* binding */ CORE_SCHEMA),
/* harmony export */   DEFAULT_SCHEMA: () => (/* binding */ DEFAULT_SCHEMA),
/* harmony export */   FAILSAFE_SCHEMA: () => (/* binding */ FAILSAFE_SCHEMA),
/* harmony export */   JSON_SCHEMA: () => (/* binding */ JSON_SCHEMA),
/* harmony export */   Schema: () => (/* binding */ Schema),
/* harmony export */   Type: () => (/* binding */ Type),
/* harmony export */   YAMLException: () => (/* binding */ YAMLException),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   dump: () => (/* binding */ dump),
/* harmony export */   load: () => (/* binding */ load),
/* harmony export */   loadAll: () => (/* binding */ loadAll),
/* harmony export */   safeDump: () => (/* binding */ safeDump),
/* harmony export */   safeLoad: () => (/* binding */ safeLoad),
/* harmony export */   safeLoadAll: () => (/* binding */ safeLoadAll),
/* harmony export */   types: () => (/* binding */ types)
/* harmony export */ });

/*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


var isNothing_1      = isNothing;
var isObject_1       = isObject;
var toArray_1        = toArray;
var repeat_1         = repeat;
var isNegativeZero_1 = isNegativeZero;
var extend_1         = extend;

var common = {
	isNothing: isNothing_1,
	isObject: isObject_1,
	toArray: toArray_1,
	repeat: repeat_1,
	isNegativeZero: isNegativeZero_1,
	extend: extend_1
};

// YAML error class. http://stackoverflow.com/questions/8458984


function formatError(exception, compact) {
  var where = '', message = exception.reason || '(unknown reason)';

  if (!exception.mark) return message;

  if (exception.mark.name) {
    where += 'in "' + exception.mark.name + '" ';
  }

  where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

  if (!compact && exception.mark.snippet) {
    where += '\n\n' + exception.mark.snippet;
  }

  return message + ' ' + where;
}


function YAMLException$1(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException$1.prototype = Object.create(Error.prototype);
YAMLException$1.prototype.constructor = YAMLException$1;


YAMLException$1.prototype.toString = function toString(compact) {
  return this.name + ': ' + formatError(this, compact);
};


var exception = YAMLException$1;

// get snippet for a single line, respecting maxLength
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = '';
  var tail = '';
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

  if (position - lineStart > maxHalfLength) {
    head = ' ... ';
    lineStart = position - maxHalfLength + head.length;
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...';
    lineEnd = position + maxHalfLength - tail.length;
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  };
}


function padStart(string, max) {
  return common.repeat(' ', max - string.length) + string;
}


function makeSnippet(mark, options) {
  options = Object.create(options || null);

  if (!mark.buffer) return null;

  if (!options.maxLength) options.maxLength = 79;
  if (typeof options.indent      !== 'number') options.indent      = 1;
  if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
  if (typeof options.linesAfter  !== 'number') options.linesAfter  = 2;

  var re = /\r?\n|\r|\0/g;
  var lineStarts = [ 0 ];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;

  var result = '', i, line;
  var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

  for (i = 1; i <= options.linesBefore; i++) {
    if (foundLineNo - i < 0) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n' + result;
  }

  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) +
    ' | ' + line.str + '\n';
  result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

  for (i = 1; i <= options.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) +
      ' | ' + line.str + '\n';
  }

  return result.replace(/\n$/, '');
}


var snippet = makeSnippet;

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'multi',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'representName',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$1(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.options       = options; // keep original options in case user wants to extend this type later
  this.tag           = tag;
  this.kind          = options['kind']          || null;
  this.resolve       = options['resolve']       || function () { return true; };
  this.construct     = options['construct']     || function (data) { return data; };
  this.instanceOf    = options['instanceOf']    || null;
  this.predicate     = options['predicate']     || null;
  this.represent     = options['represent']     || null;
  this.representName = options['representName'] || null;
  this.defaultStyle  = options['defaultStyle']  || null;
  this.multi         = options['multi']         || false;
  this.styleAliases  = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$1;

/*eslint-disable max-len*/





function compileList(schema, name) {
  var result = [];

  schema[name].forEach(function (currentType) {
    var newIndex = result.length;

    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {

        newIndex = previousIndex;
      }
    });

    result[newIndex] = currentType;
  });

  return result;
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {},
        multi: {
          scalar: [],
          sequence: [],
          mapping: [],
          fallback: []
        }
      }, index, length;

  function collectType(type) {
    if (type.multi) {
      result.multi[type.kind].push(type);
      result.multi['fallback'].push(type);
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema$1(definition) {
  return this.extend(definition);
}


Schema$1.prototype.extend = function extend(definition) {
  var implicit = [];
  var explicit = [];

  if (definition instanceof type) {
    // Schema.extend(type)
    explicit.push(definition);

  } else if (Array.isArray(definition)) {
    // Schema.extend([ type1, type2, ... ])
    explicit = explicit.concat(definition);

  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
    if (definition.implicit) implicit = implicit.concat(definition.implicit);
    if (definition.explicit) explicit = explicit.concat(definition.explicit);

  } else {
    throw new exception('Schema.extend argument should be a Type, [ Type ], ' +
      'or a schema definition ({ implicit: [...], explicit: [...] })');
  }

  implicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }

    if (type$1.loadKind && type$1.loadKind !== 'scalar') {
      throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }

    if (type$1.multi) {
      throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
    }
  });

  explicit.forEach(function (type$1) {
    if (!(type$1 instanceof type)) {
      throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
  });

  var result = Object.create(Schema$1.prototype);

  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);

  result.compiledImplicit = compileList(result, 'implicit');
  result.compiledExplicit = compileList(result, 'explicit');
  result.compiledTypeMap  = compileMap(result.compiledImplicit, result.compiledExplicit);

  return result;
};


var schema = Schema$1;

var str = new type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

var seq = new type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

var map = new type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

var failsafe = new schema({
  explicit: [
    str,
    seq,
    map
  ]
});

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new type('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; },
    empty:     function () { return '';     }
  },
  defaultStyle: 'lowercase'
});

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new type('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'o') {
      // base 8
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
  }

  // base 10 (except 0)

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  return true;
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch;

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common.isNegativeZero(object));
}

var int = new type('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0o'  + obj.toString(8) : '-0o'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common.isNegativeZero(object));
}

var float = new type('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

var json = failsafe.extend({
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});

var core = json;

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

var timestamp = new type('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new type('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

/*eslint-disable no-bitwise*/





// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  return new Uint8Array(result);
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(obj) {
  return Object.prototype.toString.call(obj) ===  '[object Uint8Array]';
}

var binary = new type('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString$1.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

var pairs = new type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var _default = core.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});

/*eslint-disable max-len,no-use-before-define*/







var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State$1(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || _default;
  this.onWarning = options['onWarning'] || null;
  // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
  // if such documents have no explicit %YAML directive
  this.legacy    = options['legacy']    || false;

  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  // position of first leading tab in the current line,
  // used to make sure there are no tabs in the indentation
  this.firstTabInLine = -1;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  var mark = {
    name:     state.filename,
    buffer:   state.input.slice(0, -1), // omit trailing \0
    position: state.position,
    line:     state.line,
    column:   state.position - state.lineStart
  };

  mark.snippet = snippet(mark);

  return new exception(message, mark);
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, 'tag prefix is malformed: ' + prefix);
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode,
  startLine, startLineStart, startPos) {

  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
        _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }

    // used for this specific key only because Object.defineProperty is slow
    if (keyNode === '__proto__') {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 0x09/* Tab */ && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _lineStart,
      _pos,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = Object.create(null),
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    } else if (ch === 0x2C/* , */) {
      // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
      throwError(state, "expected the node content, but found ','");
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line; // Save the current line.
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _keyLine,
      _keyLineStart,
      _keyPos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = Object.create(null),
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  // there is a leading tab before this token, so it can't be a block sequence/mapping;
  // it can still be flow sequence/mapping or a scalar
  if (state.firstTabInLine !== -1) return false;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, 'tab characters must not be used in indentation');
    }

    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;

      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        // Neither implicit nor explicit notation.
        // Reading is done. Go to the epilogue.
        break;
      }

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }

      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, 'tag name is malformed: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      typeList,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }

  } else if (state.tag === '?') {
    // Implicit resolving is not allowed for non-scalar types, and '?'
    // non-specific tag is only automatically assigned to plain scalars.
    //
    // We only need to check kind conformity in case user explicitly assigns '?'
    // tag, for example like this: "!<?> [0]"
    //
    if (state.result !== null && state.kind !== 'scalar') {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }

    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type = state.implicitTypes[typeIndex];

      if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
        state.result = type.construct(state.result);
        state.tag = type.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== '!') {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];
    } else {
      // looking for multi type
      type = null;
      typeList = state.typeMap.multi[state.kind || 'fallback'];

      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type = typeList[typeIndex];
          break;
        }
      }
    }

    if (!type) {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }

    if (state.result !== null && type.kind !== state.kind) {
      throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
    }

    if (!type.resolve(state.result, state.tag)) { // `state.result` updated in resolver if matched
      throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
    } else {
      state.result = type.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = Object.create(null);
  state.anchorMap = Object.create(null);

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);

  var nullpos = input.indexOf('\0');

  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, 'null byte is not allowed in input');
  }

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll$1(input, iterator, options) {
  if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
    options = iterator;
    iterator = null;
  }

  var documents = loadDocuments(input, options);

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load$1(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new exception('expected a single document in the stream, but found more');
}


var loadAll_1 = loadAll$1;
var load_1    = load$1;

var loader = {
	loadAll: loadAll_1,
	load: load_1
};

/*eslint-disable no-use-before-define*/





var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_BOM                  = 0xFEFF;
var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_CARRIAGE_RETURN      = 0x0D; /* CR */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_EQUALS               = 0x3D; /* = */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new exception('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}


var QUOTING_TYPE_SINGLE = 1,
    QUOTING_TYPE_DOUBLE = 2;

function State(options) {
  this.schema        = options['schema'] || _default;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;
  this.quotingType   = options['quotingType'] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes   = options['forceQuotes'] || false;
  this.replacer      = typeof options['replacer'] === 'function' ? options['replacer'] : null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== CHAR_BOM)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace(c) {
  return isPrintable(c)
    && c !== CHAR_BOM
    // - b-char
    && c !== CHAR_CARRIAGE_RETURN
    && c !== CHAR_LINE_FEED;
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (
    // ns-plain-safe
    inblock ? // c = flow-in
      cIsNsCharOrWhitespace
      : cIsNsCharOrWhitespace
        // - c-flow-indicator
        && c !== CHAR_COMMA
        && c !== CHAR_LEFT_SQUARE_BRACKET
        && c !== CHAR_RIGHT_SQUARE_BRACKET
        && c !== CHAR_LEFT_CURLY_BRACKET
        && c !== CHAR_RIGHT_CURLY_BRACKET
  )
    // ns-plain-char
    && c !== CHAR_SHARP // false on '#'
    && !(prev === CHAR_COLON && !cIsNsChar) // false on ': '
    || (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) // change to true on '[^ ]#'
    || (prev === CHAR_COLON && cIsNsChar); // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) && c !== CHAR_BOM
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_EQUALS
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast(c) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON;
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt(string, pos) {
  var first = string.charCodeAt(pos), second;
  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1);
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
    }
  }
  return first;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth,
  testAmbiguousType, quotingType, forceQuotes, inblock) {

  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(codePointAt(string, 0))
          && isPlainSafeLast(codePointAt(string, string.length - 1));

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey, inblock) {
  state.dump = (function () {
    if (string.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? ('"' + string + '"') : ("'" + string + "'");
      }
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth,
      testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)) {

      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new exception('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char = 0;
  var escapeSeq;

  for (var i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i);
    escapeSeq = ESCAPE_SEQUENCES[char];

    if (!escapeSeq && isPrintable(char)) {
      result += string[i];
      if (char >= 0x10000) result += string[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level, value, false, false) ||
        (typeof value === 'undefined' &&
         writeNode(state, level, null, false, false))) {

      if (_result !== '') _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length,
      value;

  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];

    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }

    // Write only valid elements, put null instead of invalid elements.
    if (writeNode(state, level + 1, value, true, true, false, true) ||
        (typeof value === 'undefined' &&
         writeNode(state, level + 1, null, true, true, false, true))) {

      if (!compact || _result !== '') {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {

    pairBuffer = '';
    if (_result !== '') pairBuffer += ', ';

    if (state.condenseFlow) pairBuffer += '"';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new exception('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      if (explicit) {
        if (type.multi && type.representName) {
          state.tag = type.representName(object);
        } else {
          state.tag = type.tag;
        }
      } else {
        state.tag = '?';
      }

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new exception('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);
  var inblock = block;
  var tagStr;

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      if (block && (state.dump.length !== 0)) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type === '[object Undefined]') {
      return false;
    } else {
      if (state.skipInvalid) return false;
      throw new exception('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      // Need to encode all characters except those allowed by the spec:
      //
      // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
      // [36] ns-hex-digit    ::=  ns-dec-digit
      //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
      // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
      // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
      // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
      //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
      //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
      //
      // Also need to encode '!' because it has special meaning (end of tag prefix).
      //
      tagStr = encodeURI(
        state.tag[0] === '!' ? state.tag.slice(1) : state.tag
      ).replace(/!/g, '%21');

      if (state.tag[0] === '!') {
        tagStr = '!' + tagStr;
      } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
        tagStr = '!!' + tagStr.slice(18);
      } else {
        tagStr = '!<' + tagStr + '>';
      }

      state.dump = tagStr + ' ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump$1(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  var value = input;

  if (state.replacer) {
    value = state.replacer.call({ '': value }, '', value);
  }

  if (writeNode(state, 0, value, true, true)) return state.dump + '\n';

  return '';
}

var dump_1 = dump$1;

var dumper = {
	dump: dump_1
};

function renamed(from, to) {
  return function () {
    throw new Error('Function yaml.' + from + ' is removed in js-yaml 4. ' +
      'Use yaml.' + to + ' instead, which is now safe by default.');
  };
}


var Type                = type;
var Schema              = schema;
var FAILSAFE_SCHEMA     = failsafe;
var JSON_SCHEMA         = json;
var CORE_SCHEMA         = core;
var DEFAULT_SCHEMA      = _default;
var load                = loader.load;
var loadAll             = loader.loadAll;
var dump                = dumper.dump;
var YAMLException       = exception;

// Re-export all types in case user wants to create custom schema
var types = {
  binary:    binary,
  float:     float,
  map:       map,
  null:      _null,
  pairs:     pairs,
  set:       set,
  timestamp: timestamp,
  bool:      bool,
  int:       int,
  merge:     merge,
  omap:      omap,
  seq:       seq,
  str:       str
};

// Removed functions from JS-YAML 3.0.x
var safeLoad            = renamed('safeLoad', 'load');
var safeLoadAll         = renamed('safeLoadAll', 'loadAll');
var safeDump            = renamed('safeDump', 'dump');

var jsYaml = {
	Type: Type,
	Schema: Schema,
	FAILSAFE_SCHEMA: FAILSAFE_SCHEMA,
	JSON_SCHEMA: JSON_SCHEMA,
	CORE_SCHEMA: CORE_SCHEMA,
	DEFAULT_SCHEMA: DEFAULT_SCHEMA,
	load: load,
	loadAll: loadAll,
	dump: dump,
	YAMLException: YAMLException,
	types: types,
	safeLoad: safeLoad,
	safeLoadAll: safeLoadAll,
	safeDump: safeDump
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (jsYaml);



/***/ }),

/***/ "./benchmark/mocks/nest_100.json":
/*!***************************************!*\
  !*** ./benchmark/mocks/nest_100.json ***!
  \***************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"referenced":{"value":"{nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest.nest}","type":"dimension"},"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"nest":{"value":"10px","type":"dimension"}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}');

/***/ }),

/***/ "./src/config/tokenType.defs.json":
/*!****************************************!*\
  !*** ./src/config/tokenType.defs.json ***!
  \****************************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"sizing":{"label":"Sizing","property":"Size","type":"sizing","schemas":{"value":{"type":"string"}}},"spacing":{"label":"Spacing","property":"Value","type":"spacing","schemas":{"value":{"type":"string"}}},"color":{"label":"Color","property":"Color","type":"color","schemas":{"value":{"type":"string"}},"help":"If a (local) style is found with the same name it will match to that, if not, will use hex value. Use \'Create Style\' to batch-create styles from your tokens (e.g. in your design library). In the future we\'ll load all \'remote\' styles and reference them inside the JSON."},"borderRadius":{"label":"Border Radius","property":"Border Radius","type":"borderRadius","schemas":{"value":{"type":"string"}}},"borderWidth":{"label":"Border Width","property":"Border Width","type":"borderWidth","explainer":"Enter as a number, e.g. 4","schemas":{"value":{"type":"string"}}},"border":{"label":"Border","property":"Border","type":"border","schemas":{"value":{"type":"object","properties":{"color":{"type":"string"},"width":{"type":"string"},"style":{"type":"string"}}}}},"opacity":{"label":"Opacity","property":"Opacity","type":"opacity","explainer":"Set as 50% or 0.5","schemas":{"value":{"type":"string"}}},"boxShadow":{"label":"Box Shadow","property":"Box Shadow","type":"boxShadow","schemas":{"value":{"type":"object","properties":{"x":{"type":"string"},"y":{"type":"string"},"blur":{"type":"string"},"spread":{"type":"string"},"color":{"type":"string"},"type":{"type":"string"}}}}},"typography":{"label":"Typography","property":"Typography","type":"typography","help":"If a (local) style is found with the same name it will match to that, if not, will use raw font values. Use \'Create Style\' to batch-create styles from your tokens (e.g. in your design library). In the future we\'ll load all \'remote\' styles and reference them inside the JSON.","schemas":{"value":{"type":"object","properties":{"fontFamily":{"type":"string"},"fontWeight":{"type":"string"},"fontSize":{"type":"string"},"lineHeight":{"type":"string"},"letterSpacing":{"type":"string"},"paragraphSpacing":{"type":"string"},"paragraphIndent":{"type":"string"},"textDecoration":{"type":"string"},"textCase":{"type":"string"}}}}},"fontFamilies":{"label":"Font Family","property":"Font Family","type":"fontFamilies","help":"Only works in combination with a Font Weight","schemas":{"value":{"type":"string"}}},"fontWeights":{"label":"Font Weight","property":"Font Weight","type":"fontWeights","schemas":{"value":{"type":"string"}}},"lineHeights":{"label":"Line Height","property":"Line Height","type":"lineHeights","explainer":"e.g. 100% or 14","schemas":{"value":{"type":"string"}}},"fontSizes":{"label":"Font Size","property":"Font Size","type":"fontSizes","schemas":{"value":{"type":"string"}}},"letterSpacing":{"label":"Letter Spacing","property":"Letter Spacing","type":"letterSpacing","schemas":{"value":{"type":"string"}}},"paragraphSpacing":{"label":"Paragraph Spacing","property":"Paragraph Spacing","type":"paragraphSpacing","schemas":{"value":{"type":"string"}}},"textCase":{"label":"Text Case","property":"TextCase","type":"textCase","explainer":"none | uppercase | lowercase | capitalize","schemas":{"value":{"type":"string"}}},"textDecoration":{"label":"Text Decoration","property":"TextDecoration","type":"textDecoration","explainer":"none | underline | line-through","schemas":{"value":{"type":"string"}}},"composition":{"label":"Composition","property":"Composition","type":"composition","isPro":true,"schemas":{"value":{"type":"object","properties":{}}}},"asset":{"label":"Assets","property":"Asset","type":"asset","explainer":"Public URL of your asset","schemas":{"value":{"type":"string"}}},"dimension":{"label":"Dimension","property":"Dimension","type":"dimension","schemas":{"value":{"type":"string"}}},"boolean":{"label":"Boolean","property":"Boolean","type":"boolean","explainer":"true | false","schemas":{"value":{"type":"string"}}},"text":{"label":"Text","property":"Text","type":"text","schemas":{"value":{"type":"string"}}},"number":{"label":"Number","property":"Number","type":"number","schemas":{"value":{"type":"string"}}},"other":{"label":"Other","property":"other","type":"other","schemas":{"value":{"type":"string"}}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!***********************************************!*\
  !*** ./benchmark/tests/transform_nest_100.ts ***!
  \***********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _src_utils_transform__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../src/utils/transform */ "./src/utils/transform.ts");
/* harmony import */ var _mocks_nest_100_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../mocks/nest_100.json */ "./benchmark/mocks/nest_100.json");


// @ts-ignore
(0,_src_utils_transform__WEBPACK_IMPORTED_MODULE_0__["default"])({
    core: _mocks_nest_100_json__WEBPACK_IMPORTED_MODULE_1__
}, [
    "core"
], [], {
    expandTypography: true,
    expandShadow: false,
    expandComposition: true,
    preserveRawValue: false,
    throwErrorWhenNotResolved: false,
    resolveReferences: true,
    expandBorder: false
});

})();

/******/ })()
;
//# sourceMappingURL=transform_nest_100.js.map