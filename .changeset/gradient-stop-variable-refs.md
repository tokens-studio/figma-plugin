---
"@tokens-studio/figma-plugin": patch
---

Gradient styles whose colors reference other color tokens are now created when syncing with Tokens Studio, with each color stop bound to its variable. Previously these gradient styles weren't created at all.
