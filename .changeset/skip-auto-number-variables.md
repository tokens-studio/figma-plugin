---
"@tokens-studio/figma-plugin": patch
---

Tokens whose value is `AUTO` (e.g. spacing, sizing or lowercase `auto` line heights) are no longer exported as number variables, which previously created them with a value of `0`.
