---
"@tokens-studio/figma-plugin": patch
---

Importing variables no longer changes the type or unit of existing tokens. A font weight stays a `fontWeights` token with its unitless value, and a `px` or `rem` dimension keeps its unit. Only the number is updated when it changed in Figma. Tokens that didn't change are no longer listed as updates, and modifiers, the deprecated flag and other metadata are kept.
