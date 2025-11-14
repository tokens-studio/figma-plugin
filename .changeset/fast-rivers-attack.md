---
"@tokens-studio/figma-plugin": patch
---

Fix letterSpacing value 0 being converted to none. Letter spacing with value 0 is now properly handled and "none" is converted to 0 as it's not a valid CSS letter-spacing value.
