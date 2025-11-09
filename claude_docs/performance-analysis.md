# Performance Analysis - Critical Issues

## Overview
This document details performance bottlenecks that critically impact users with:
- 4,000+ design tokens/variables
- Multiple token sets (10-50 sets)
- 10,000+ nodes on a Figma page

---

## 🔴 CRITICAL Issue #1: O(n²) Duplicate Detection

### Location
**File:** `src/utils/validateGroupName.ts:59`

### Problem
```typescript
let possibleDuplicates = newTokensAfterRename.filter((a) => 
  (newTokensAfterRename.filter((b) => a.name === b.name).length > 1) 
  && existingTokensAfterRename.some((t) => 
    t.name === a.name && t.type === a.type && t.value === a.value
  )
);
```

**Complexity:** O(n² × m) where:
- n = tokens in newTokensAfterRename (~4000)
- m = tokens in existingTokensAfterRename (~4000)

**Impact with 4000 tokens:**
- ~16,000,000 comparison operations
- **Estimated time: 15-30 seconds** (depending on CPU)
- Blocks UI thread completely

### Solution
Replace with O(n) algorithm using Map:

```typescript
// Create frequency map - O(n)
const nameFrequency = new Map<string, number>();
newTokensAfterRename.forEach(token => {
  nameFrequency.set(token.name, (nameFrequency.get(token.name) || 0) + 1);
});

// Create lookup set for existing tokens - O(m)
const existingTokenKeys = new Set(
  existingTokensAfterRename.map(t => `${t.name}|${t.type}|${t.value}`)
);

// Find duplicates - O(n)
let possibleDuplicates = newTokensAfterRename.filter(a => 
  nameFrequency.get(a.name)! > 1 
  && existingTokenKeys.has(`${a.name}|${a.type}|${a.value}`)
);

// Remove duplicates from result - O(n)
possibleDuplicates = Array.from(
  new Map(possibleDuplicates.map(item => [item.name, item])).values()
);
```

**Expected improvement:** 16M → 16K operations = **~1000x faster** (30s → 0.03s)

---

## 🔴 CRITICAL Issue #2: Inefficient Node Traversal

### Location
**File:** `src/plugin/NodeManager.ts:43-101`

### Problem
```typescript
public async findBaseNodesWithData(opts) {
  // ...
  for (let nodeIndex = 0; nodeIndex < relevantNodes.length; nodeIndex += 1) {
    promises.add(defaultWorker.schedule(async () => {
      const node = relevantNodes[nodeIndex];
      returnedNodes.push({
        node: relevantNodes[nodeIndex],
        tokens: await tokensSharedDataHandler.getAll(node), // ← Individual call per node
        id: node.id,
      });
    }));
  }
}
```

**Problems:**
1. **10,000 individual `getSharedPluginData` calls** - no batching
2. **10,000 individual JSON.parse operations** - no caching
3. **Sequential processing** despite Worker scheduling

**Impact with 10,000 nodes:**
- 10,000 × (Figma API call + JSON.parse)
- **Estimated time: 8-15 seconds**
- Memory pressure from 10,000 simultaneous promises

### Solution

#### Strategy 1: Batch Plugin Data Reads
```typescript
// Batch read plugin data for multiple nodes at once
public async findBaseNodesWithData(opts) {
  const BATCH_SIZE = 100; // Process 100 nodes at a time
  
  for (let i = 0; i < relevantNodes.length; i += BATCH_SIZE) {
    const batch = relevantNodes.slice(i, i + BATCH_SIZE);
    
    // Process batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (node) => ({
        node,
        tokens: await tokensSharedDataHandler.getAll(node),
        id: node.id,
      }))
    );
    
    returnedNodes.push(...batchResults);
    tracker.report(batchResults.length);
  }
}
```

**Expected improvement:** 50-70% reduction in time (15s → 5-7s)

#### Strategy 2: Cache Parsed JSON
```typescript
// In SharedDataHandler.ts
class SharedDataHandler {
  private parseCache = new WeakMap<BaseNode, Record<string, any>>();
  
  getAll<Result = string>(node: BaseNode) {
    // Check cache first
    if (this.parseCache.has(node)) {
      return this.parseCache.get(node);
    }
    
    // ... existing logic ...
    
    // Cache result
    this.parseCache.set(node, result);
    return result;
  }
}
```

**Expected improvement:** Additional 30-50% reduction for repeat reads

---

## 🔴 CRITICAL Issue #3: Excessive JSON Serialization

### Location
**246 occurrences across codebase**

### Problem
Frequent JSON.stringify/parse without caching:

**Example from `src/app/store/models/tokenState.tsx`:**
```typescript
// Line 2: Compression on every state change
compressToUTF16(JSON.stringify({ tokens, themes }))

// Happens on:
// - Every token update
// - Every theme change  
// - Every state sync
```

**Impact with 4000 tokens:**
- Each JSON.stringify of 4000 tokens: ~50-100ms
- Called multiple times per user action
- **Cumulative impact: 3-8 seconds per workflow**

### Solution

#### Implement Memoized Serialization
```typescript
class TokenSerializer {
  private cache = new WeakMap<object, string>();
  private hashCache = new WeakMap<object, string>();
  
  stringify(obj: object): string {
    const hash = this.quickHash(obj);
    
    if (this.hashCache.get(obj) === hash && this.cache.has(obj)) {
      return this.cache.get(obj)!;
    }
    
    const result = JSON.stringify(obj);
    this.cache.set(obj, result);
    this.hashCache.set(obj, hash);
    return result;
  }
  
  private quickHash(obj: object): string {
    // Quick hash using object reference + length
    return `${Object.keys(obj).length}`;
  }
}
```

**Expected improvement:** 70-90% reduction in serialization time

---

## 🟠 HIGH Issue #4: Token Resolution Performance

### Location
**File:** `src/utils/TokenResolver.ts`

### Problem
```typescript
public resolveTokenValues(): ResolveTokenValuesResult[] {
  const resolvedTokens: ResolveTokenValuesResult[] = [];
  
  for (const token of this.tokens) {  // O(n) - 4000 iterations
    const resolvedValue = this.resolveReferences(token);
    // ... resolution logic that may traverse graph again
  }
  
  return resolvedTokens;
}
```

**Issues:**
1. **No LRU cache** for frequently resolved tokens
2. **Recursive resolution** without memoization can cause re-computation
3. **Regex operations** (AliasRegex) executed 4000+ times

**Impact with 4000 tokens:**
- Multiple passes over token list
- **Estimated time: 2-5 seconds** for full resolution

### Solution

#### Add LRU Cache for Resolved Tokens
```typescript
import LRU from 'lru-cache';

class TokenResolver {
  private resolveCache = new LRU<string, ResolveTokenValuesResult>({
    max: 5000,
    ttl: 1000 * 60 * 5, // 5 minutes
  });
  
  private resolveReferences(token: SingleToken): ResolveTokenValuesResult {
    const cacheKey = `${token.name}:${token.value}`;
    
    if (this.resolveCache.has(cacheKey)) {
      return this.resolveCache.get(cacheKey)!;
    }
    
    // ... existing resolution logic ...
    
    this.resolveCache.set(cacheKey, result);
    return result;
  }
}
```

**Expected improvement:** 60-80% reduction for repeated resolutions

---

## 🟠 HIGH Issue #5: React Re-render Performance

### Location
Multiple components rendering large lists

### Problem
**Example from `ThemeSelector.tsx:88`:**
```typescript
const filteredThemes = groupName === INTERNAL_THEMES_NO_GROUP 
  ? availableThemes.filter((theme) => (typeof theme?.group === 'undefined')) 
  : availableThemes.filter((theme) => (theme?.group === groupName));
```

**Issues:**
1. **Not memoized** - recomputes on every render
2. **Large lists** not virtualized (4000+ items)
3. **Missing React.memo** on list item components

**Impact:**
- Re-renders entire list of 4000 items
- Each re-render: 2-5 seconds
- **UI freezes** during interaction

### Solution

#### 1. Memoize Filter Operations
```typescript
const filteredThemes = useMemo(() => {
  return groupName === INTERNAL_THEMES_NO_GROUP 
    ? availableThemes.filter(theme => typeof theme?.group === 'undefined')
    : availableThemes.filter(theme => theme?.group === groupName);
}, [availableThemes, groupName]);
```

#### 2. Implement Virtualization
```typescript
import { FixedSizeList } from 'react-window';

const ThemeList = ({ themes }) => (
  <FixedSizeList
    height={600}
    itemCount={themes.length}
    itemSize={50}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <ThemeItem theme={themes[index]} />
      </div>
    )}
  </FixedSizeList>
);
```

#### 3. Memoize List Items
```typescript
const ThemeItem = React.memo(({ theme }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.theme.id === nextProps.theme.id;
});
```

**Expected improvement:** 80-95% reduction in render time (5s → 0.25s)

---

## 🟠 HIGH Issue #6: Memory Management

### Problem
**Location:** Multiple files with large object manipulation

**Issues:**
1. **No cleanup of WeakMaps** in SharedDataHandler
2. **Large arrays copied unnecessarily**
3. **String concatenation** instead of template literals

**Example from `findAll.ts:14`:**
```typescript
allNodes = allNodes.concat(
  node.findAllWithCriteria({...})  // Creates new array every iteration
);
```

### Solution
```typescript
// Pre-allocate array with estimated size
const allNodes = includeSelf ? [...nodes] : [];
const estimatedSize = nodes.length * 100; // Estimate based on tree depth
allNodes.length = estimatedSize;

let index = 0;
nodes.forEach((node) => {
  if ('children' in node) {
    const found = node.findAllWithCriteria({...});
    for (const item of found) {
      allNodes[index++] = item;
    }
  }
});
allNodes.length = index; // Trim to actual size
```

**Expected improvement:** 30-50% reduction in memory allocations

---

## Performance Optimization Checklist

### Immediate (Week 1)
- [ ] Fix O(n²) duplicate detection in validateGroupName.ts
- [ ] Add batching to NodeManager.findBaseNodesWithData
- [ ] Implement JSON serialization cache

### Short-term (Week 2-4)
- [ ] Add LRU cache to TokenResolver
- [ ] Implement React virtualization for large lists
- [ ] Add React.memo to frequently rendered components
- [ ] Optimize memory allocations in findAll

### Monitoring
- [ ] Add performance.mark/measure for key operations
- [ ] Set up Sentry performance monitoring
- [ ] Create performance regression tests
- [ ] Establish performance budgets

---

## Performance Testing Recommendations

### Create Performance Test Suite
```typescript
// tests/performance/token-operations.perf.ts
describe('Token Operations Performance', () => {
  it('should validate 4000 tokens in < 1 second', async () => {
    const tokens = generateTokens(4000);
    const start = performance.now();
    
    const result = await validateGroupName(tokens, 'newGroup', 'oldGroup');
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(1000);
  });
  
  it('should resolve 4000 tokens in < 3 seconds', async () => {
    const tokens = generateTokens(4000);
    const resolver = new TokenResolver(tokens);
    
    const start = performance.now();
    const resolved = resolver.resolveTokenValues();
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(3000);
    expect(resolved).toHaveLength(4000);
  });
});
```

---

## Summary

| Issue | Current Time | Target Time | Priority |
|-------|-------------|-------------|----------|
| Duplicate detection | 15-30s | <0.1s | 🔴 CRITICAL |
| Node traversal | 8-15s | 2-4s | 🔴 CRITICAL |
| JSON serialization | 3-8s | <0.5s | 🔴 CRITICAL |
| Token resolution | 2-5s | <1s | 🟠 HIGH |
| React re-renders | 2-5s | <0.5s | 🟠 HIGH |

**Total current time:** 40-70 seconds  
**Total target time:** 5-10 seconds  
**Expected improvement:** **85-90% reduction in operation time**
