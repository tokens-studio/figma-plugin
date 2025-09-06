---
"@tokens-studio/figma-plugin": patch
---

fix: improve variable precision handling and prevent unnecessary updates

Changed color and number variable precision handling from rounding to clipping for more consistent behavior. Numbers now normalize to 6 decimal places and variables won't update unnecessarily when normalized values are identical. This reduces flickering and improves performance by preventing redundant Figma API calls.