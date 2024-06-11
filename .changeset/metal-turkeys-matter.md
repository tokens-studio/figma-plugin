---
"@tokens-studio/figma-plugin": patch
---

Fixed an issue where variable references weren't using references from the current theme but from another theme that was using the same token names. If you are creating multiple collections with the same token structure, it's recommended to create them one by one to avoid reference clashes. For the default scenario of where different theme groups don't share the same tokens (recommended), you can create all themes at once.
