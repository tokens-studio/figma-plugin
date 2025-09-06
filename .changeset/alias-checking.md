---
"@tokens-studio/figma-plugin": patch
---

fix: prevent unnecessary variable alias recreation

Add optimization to skip variable updates when alias already points to the correct target variable. This means your variablres should no longer show up as changed in Figma if their value stayed the same.
