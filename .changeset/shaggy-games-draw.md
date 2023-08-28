---
"@tokens-studio/figma-plugin": patch
---

- Improved performance of applying by removing unnecessary calls to check if we need to apply a variable.
- Fixed an issue that caused local variables to be applied if they matched name of an applied token
