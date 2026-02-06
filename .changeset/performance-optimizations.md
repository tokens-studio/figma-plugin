---
"@tokens-studio/figma-plugin": patch
---

Performance improvements: Advanced optimizations including regex caching, Map-based lookups, and algorithm improvements

- Replaced O(n²) nested filter operations in validateGroupName.ts with O(n) Map-based duplicate detection
- Created deepClone utility that uses native structuredClone when available (2-5x faster than JSON.parse/stringify) with improved error handling for edge cases
- Applied deepClone optimization to tokenState and TokensStudioTokenStorage utilities
- Optimized chained filter/map operations in credentials.ts, TokenSetTree.tsx, and ConfirmDialog.tsx by combining into single-pass reduce operations
- Added memoization to ImportedTokensDialog for parent calculation to prevent unnecessary recalculations
- Optimized ThemeSelector by creating a Map for faster theme lookups by group (eliminates redundant filtering)
- Improved pullStyles.ts font family extraction by removing double iteration
- **NEW: Optimized pluginData.ts** - Replaced nested find().find() with Map-based O(1) lookups for token/variable/style deduplication
- **NEW: Created regex cache utility** - Caches compiled regex patterns for significant performance gains with repeated pattern matching
- **NEW: Optimized checkIfAlias** - Flattened nested some() operations to reduce overhead
- **NEW: Optimized convertTokens** - Eliminated intermediate array creation by using Object.keys() with direct iteration instead of Object.values().map()
- Enhanced test coverage with 15 additional tests (6 for regex cache, 4 for deepClone edge cases)
- Added comprehensive performance documentation with best practices
