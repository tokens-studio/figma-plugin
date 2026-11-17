---
'@tokens-studio/figma-plugin': patch
---

Replaced the unmaintained expr-eval package with a small built-in math evaluator, and updated the Supernova SDK, which also depended on expr-eval. This fixes the security alerts on expr-eval. Math, functions and conditionals in token values keep working. Rarely used syntax now stays unresolved: arrays, assignment, function definitions, comments, `;`, `||`, `in`, `!`, `fac`, `gamma`, `random`, `length`, hex and binary numbers, backslash escapes in strings, function names passed as values such as `sample(min,1,2)`, calls without parentheses such as `sqrt 16`, and arguments without commas such as `min(1 2)`.
