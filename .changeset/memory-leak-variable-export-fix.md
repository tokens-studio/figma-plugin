---
"@tokens-studio/figma-plugin": patch
---

Fix memory leak in variable export by implementing batched token processing

When exporting large amounts of tokens to variables, the previous implementation would create unlimited concurrent promises via Promise.all(), causing memory exhaustion. This change implements batched processing that processes tokens in chunks of 50, significantly reducing memory usage during variable export operations while maintaining functionality.