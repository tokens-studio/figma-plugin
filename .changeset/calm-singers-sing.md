---
"@tokens-studio/figma-plugin": patch
---

Improve variable creation performance with batching, and tighten progress tracking; fix theme token-source handling.

- Added batching for variable creation to avoid memory-related issues.
- Faster alias linking and caching for imports.
- Clear progress phases and accurate counts.
