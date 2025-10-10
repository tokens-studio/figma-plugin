---
"@tokens-studio/figma-plugin": patch
---

Fix text style import issues with Figma variables and font weight matching

- Fixed broken typography tokens showing {undefined} when importing text styles that use Figma variables
- Text styles with variables now properly create tokens with the variable's actual values instead of showing {undefined}
- Font sizes, line heights, and spacing values are now correctly imported as numbers instead of strings
- Typography tokens now fall back to raw values when referenced tokens don't exist, preventing undefined references
