---
"@tokens-studio/figma-plugin": patch
---

Fix gap token deselection when left-clicking. Previously, left-clicking a gap token to deselect it would incorrectly attempt to remove the first property instead of the property that actually has the token applied. This caused the gap value to disappear from Figma's side panel while the token remained active in the inspect panel. The fix ensures that the correct property is toggled when deselecting tokens.
