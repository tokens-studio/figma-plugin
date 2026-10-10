---
"@tokens-studio/figma-plugin": patch
---

Importing variables no longer turns existing font weight tokens into `px` dimensions or numbers. They stay unitless `fontWeights` tokens, and only their number is updated. Tokens that were already imported are no longer listed as updates again when nothing changed in Figma.
