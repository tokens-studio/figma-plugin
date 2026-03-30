---
"@tokens-studio/figma-plugin": patch
---

Fix baseFontSize token reference not resolving per theme when token value is a plain number

When a token referenced in the plugin's `baseFontSize` setting resolved to a plain
numeric value (e.g., `16` rather than `'16px'`), the per-theme baseFontSize was
silently ignored during Variables/Styles export. All themes would use the currently
active theme's baseFontSize instead of resolving the alias independently per theme.

This happened because `getAliasValue` returns a `number` type for plain numeric tokens
(via `checkAndEvaluateMath`), but the condition in `updateVariables.ts` only accepted
`string` values, so the per-theme resolved value was discarded.

The fix extends the condition to also accept numeric resolved values, converting them
to strings before use — exactly matching the behaviour that was already working for
string values like `'16px'`.
