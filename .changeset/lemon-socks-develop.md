---
"@tokens-studio/figma-plugin": patch
---

Fixed an issue where tokens using complex modifiers (such as `set_alpha`) were incorrectly exported as white or caused errors in Figma variables. This update ensures that the accurately resolved values visible in the Studio UI are correctly preserved during the export process for Tokens Studio OAuth users.
