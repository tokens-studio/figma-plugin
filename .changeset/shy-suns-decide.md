---
"@tokens-studio/figma-plugin": patch
---

Fix text style import issues with Figma variables

- Fixed broken typography tokens showing {undefined} when importing text styles that use Figma variables
- Text styles with variables now properly create tokens with the variable's actual values instead of showing {undefined}
- Font sizes, line heights, and spacing values are now correctly imported as numbers instead of numbers inside strings
