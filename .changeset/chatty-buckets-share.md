---
"@tokens-studio/figma-plugin": patch
---

Fixed an issue around variable creation where if numerical weights were used we'd display an error that we're unable to apply the font. We now changed this to properly load all weights of the font family and then create styles correctly with variable references to the numerical weight variable
