---
"@tokens-studio/figma-plugin": patch
---

Fix linting errors and add token type-based variable scope filtering

- Fixed all ESLint errors in FigmaVariableForm.tsx and setValuesOnVariable.ts
- Added intelligent filtering of variable scopes based on token type (e.g., color tokens only show color-related scopes)
- Improved code organization by extracting arrow functions into useCallback hooks
- Fixed nested ternary expressions for better readability