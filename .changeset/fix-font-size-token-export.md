---
"@tokens-studio/figma-plugin": patch
---

Fix font size token export for different typography baselines across themes

When exporting tokens with expandTypography enabled, composite tokens (like typography tokens) now correctly use resolved values from the provided resolvedTokens array instead of the original unresolved token values. This ensures that font size tokens and other properties within typography tokens reflect the correct baseline values for each theme when tokens are resolved per theme.