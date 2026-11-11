---
"@tokens-studio/figma-plugin": patch
---

Fixed typography tokens not applying with Tokens Studio sync: font family, text case and text decoration were dropped when the server returned a typography value in an unexpected format, so the text layer stayed unchanged.
