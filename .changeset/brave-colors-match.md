---
"@tokens-studio/figma-plugin": patch
---

Fixed exported variables and styles getting the wrong value for modified colors that reference another theme group. When several options of that group were exported, the value came from whichever set was stored last. It now comes from the active option, matching what the plugin shows.
