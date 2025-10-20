---
"@tokens-studio/figma-plugin": patch
---

Performance improvements: Optimized nested filter operations and replaced JSON-based deep cloning with more efficient structuredClone

- Replaced O(n²) nested filter operations in validateGroupName.ts with O(n) Map-based duplicate detection
- Created deepClone utility that uses native structuredClone when available (2-5x faster than JSON.parse/stringify)
- Applied deepClone optimization to tokenState, TokensStudioTokenStorage, and annotations utilities
