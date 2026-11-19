---
"@tokens-studio/figma-plugin": patch
---

Fixed exported variables and styles getting an unpredictable value for modified colors that reference a token from another theme group. When several options of that group were exported, the value came from whichever set was stored last. It now comes from the first exported option of that group, in theme order, regardless of the active theme. This does not apply when the referenced token is also defined in one of the exported theme's own sets (for example a source set), which still takes precedence.
