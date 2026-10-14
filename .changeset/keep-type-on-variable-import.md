---
"@tokens-studio/figma-plugin": patch
---

Importing variables no longer turns existing font weight tokens into `px` dimensions or numbers. They stay unitless `fontWeights` tokens, and only their number is updated. A number variable scoped to font weight alone, or a string variable scoped to font style alone, is always imported as a `fontWeights` token, without `px` or `rem` conversion. The import also skips Figma's default metadata (all scopes, not hidden from publishing) unless a token had other values for it, and tokens no longer show up as updated when nothing changed in Figma.
