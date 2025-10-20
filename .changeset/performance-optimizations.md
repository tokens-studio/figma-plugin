---
"@tokens-studio/figma-plugin": patch
---

Performance improvements: Optimized nested filter operations, replaced JSON-based deep cloning, and eliminated redundant array iterations

- Replaced O(n²) nested filter operations in validateGroupName.ts with O(n) Map-based duplicate detection
- Created deepClone utility that uses native structuredClone when available (2-5x faster than JSON.parse/stringify)
- Applied deepClone optimization to tokenState and TokensStudioTokenStorage utilities
- Optimized chained filter/map operations in credentials.ts, TokenSetTree.tsx, and ConfirmDialog.tsx by combining into single-pass reduce operations
- Added comprehensive test coverage and performance documentation with best practices
