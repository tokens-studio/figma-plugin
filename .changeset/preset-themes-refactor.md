---
"@tokens-studio/figma-plugin": patch
---

Refactor preset loading to use predefined themes instead of manual usedTokenSet creation

Each preset now defines its own themes with selectedTokenSets configuration, making the preset loading more declarative and eliminating manual token set detection logic.