---
"@tokens-studio/figma-plugin": patch
---

Performance improvements: Enhanced code efficiency with additional optimizations and better error handling

- Replaced O(n²) nested filter operations in validateGroupName.ts with O(n) Map-based duplicate detection
- Created deepClone utility that uses native structuredClone when available (2-5x faster than JSON.parse/stringify) with improved error handling for edge cases
- Applied deepClone optimization to tokenState and TokensStudioTokenStorage utilities
- Optimized chained filter/map operations in credentials.ts, TokenSetTree.tsx, and ConfirmDialog.tsx by combining into single-pass reduce operations
- Added memoization to ImportedTokensDialog for parent calculation to prevent unnecessary recalculations
- Optimized ThemeSelector by creating a Map for faster theme lookups by group (eliminates redundant filtering)
- Improved pullStyles.ts font family extraction by removing double iteration
- Enhanced test coverage with 4 additional edge case tests for deepClone utility
- Added comprehensive performance documentation with best practices
