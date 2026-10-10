---
"@tokens-studio/figma-plugin": patch
---

Importing variables no longer turns existing font weight tokens into `px` dimensions or numbers. They stay unitless `fontWeights` tokens, and only their number is updated. The import also skips Figma's default metadata (all scopes, not hidden from publishing) unless a token had other values for it, and tokens no longer show up as updated when nothing changed in Figma.
