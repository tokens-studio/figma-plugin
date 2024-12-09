---
"@tokens-studio/figma-plugin": patch
---

Fixes an issue when updating a token's value from a reference to a hard value, the check we introduced in the last release caused those to not be updated (and only worked when changing to another reference).
