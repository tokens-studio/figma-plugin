---
"@tokens-studio/figma-plugin": patch
---

Fix styles showing up as changed in Figma's Publish dialog after exporting again, even when nothing was actually changed. Re-exporting styles (e.g. from a theme) should be a no-op when your tokens haven't changed.
