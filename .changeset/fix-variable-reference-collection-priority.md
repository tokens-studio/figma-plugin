---
"@tokens-studio/figma-plugin": patch
---

Fix inconsistent variable reference behavior when not using theme groups

When exporting tokens to variables without theme groups, variable references now correctly prioritize variables from the same collection instead of always using the first match found globally. This ensures Theme B displays its own primary color rather than incorrectly showing Theme A's primary color.