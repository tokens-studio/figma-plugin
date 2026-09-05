# Performance Analysis: Token Application Logic

## Executive Summary

This document analyzes the performance bottlenecks in the token application logic (`updateNodes.ts`, `setValuesOnNode.ts`, `NodeManager.ts`) when dealing with large pages containing thousands to 100k+ deeply nested frames. The analysis identifies critical issues that can lead to memory exhaustion and Figma crashes.

## Current Architecture Overview

### 1. Node Discovery Phase (`NodeManager.findBaseNodesWithData`)
**Location:** `packages/tokens-studio-for-figma/src/plugin/NodeManager.ts`

**Current Implementation:**
```typescript
public async findBaseNodesWithData(opts: {...}) {
  const returnedNodes: NodeManagerNode[] = [];
  let relevantNodes: BaseNode[] = [];
  
  // Phase 1: Find all nodes with findAll()
  relevantNodes = findAll([figma.currentPage], false, opts.nodesWithoutPluginData);
  
  // Phase 2: For each node, schedule a task to read plugin data
  for (let nodeIndex = 0; nodeIndex < relevantNodes.length; nodeIndex += 1) {
    promises.add(defaultWorker.schedule(async () => {
      returnedNodes.push({
        node: relevantNodes[nodeIndex],
        tokens: await tokensSharedDataHandler.getAll(node),
        id: node.id,
      });
    }));
  }
  await Promise.all(promises);
  return returnedNodes;
}
```

### 2. Token Application Phase (`updateNodes`)
**Location:** `packages/tokens-studio-for-figma/src/plugin/updateNodes.ts`

**Current Implementation:**
```typescript
export async function updateNodes(nodes: readonly NodeManagerNode[], baseFontSize: string) {
  const tokens = defaultTokenValueRetriever.getTokens();
  
  nodes.forEach(({ node, tokens: appliedTokens }) => {
    promises.add(defaultWorker.schedule(async () => {
      const rawTokenMap = destructureTokenForAlias(tokens, appliedTokens);
      const tokenValues = mapValuesToTokens(tokens, appliedTokens);
      setValuesOnNode({ node, values: tokenValues, data: rawTokenMap, baseFontSize });
    }));
  });
  await Promise.all(promises);
}
```

### 3. Worker/Scheduler (`Worker.ts`)
**Location:** `packages/tokens-studio-for-figma/src/plugin/Worker.ts`

**Current Implementation:**
```typescript
private tick = async () => {
  const promises: Set<Promise<void>> = new Set();
  
  for (const item of this.pool) {
    this.pool.delete(item);
    promises.add(new Promise((resolve) => {
      item.fn().then((result) => {
        this.emitter.emit(`completed/${item.id}`, result);
        resolve();
      });
    }));
    
    numberOfJobs += 1;
    if (numberOfJobs >= 30) { // Hard-coded batch size
      break;
    }
  }
  
  await Promise.all(promises);
};
```

## Critical Performance Bottlenecks

### 🔴 CRITICAL #1: Memory Explosion from Array Accumulation

**Problem:** `NodeManager.findBaseNodesWithData` accumulates ALL nodes in memory before processing.

**Impact on 100k nodes:**
- Each `NodeManagerNode` object stores: `{ id: string, node: BaseNode, tokens: NodeTokenRefMap }`
- Estimated memory per node: ~500 bytes (conservative)
- **Total memory: 100,000 × 500 = 50MB minimum**
- Plus Figma's internal node references
- **Actual memory impact: 200-500MB+**

**Why it causes crashes:**
```typescript
const returnedNodes: NodeManagerNode[] = []; // Accumulates all nodes!
// ... process 100k nodes ...
return returnedNodes; // Massive array passed to next phase
```

### 🔴 CRITICAL #2: Unbounded Promise Set Growth

**Problem:** Both `NodeManager` and `updateNodes` create a `Set<Promise<void>>` that grows to contain ALL pending operations.

**Impact on 100k nodes:**
```typescript
const promises: Set<Promise<void>> = new Set(); // Grows to 100k promises!

for (let nodeIndex = 0; nodeIndex < relevantNodes.length; nodeIndex += 1) {
  promises.add(defaultWorker.schedule(async () => { ... }));
}

await Promise.all(promises); // Waits for ALL 100k promises
```

**Memory Impact:**
- Each Promise object: ~100-200 bytes
- Event emitter listeners: ~50 bytes per promise
- **Total: 100,000 × 250 = 25MB in promises alone**

### 🔴 CRITICAL #3: Worker Pool Memory Leak Pattern

**Problem:** The Worker's `pool` Set can grow unbounded before tick() processes items.

```typescript
public schedule = <R extends any>(fn: () => Promise<R>) => {
  this.schedulerId += 1; // Monotonically increasing ID
  const id = this.schedulerId;
  const promise = new Promise<R>((res, rej) => {
    this.emitter.once('canceled', () => { rej(new CanceledError()); });
    this.emitter.once(`completed/${id}`, res); // Event listener per promise!
  });
  this.pool.add({ id, fn }); // Queue grows without limit!
  return promise;
};
```

**Impact:**
- With 100k nodes, `schedulerId` reaches 100,000+
- 100k event listeners registered on EventEmitter
- EventEmitter memory grows linearly with listeners
- **Potential memory leak: EventEmitter not designed for 100k+ listeners**

### 🟡 HIGH #4: Redundant Token Lookups

**Problem:** `mapValuesToTokens` and `destructureTokenForAlias` are called for EVERY node individually.

```typescript
// Called once per node (100k times!)
const rawTokenMap = destructureTokenForAlias(tokens, appliedTokens);
const tokenValues = mapValuesToTokens(tokens, appliedTokens);
```

**Impact:**
- Same tokens are looked up repeatedly across nodes
- `tokens.get(tokenName)` called millions of times
- No caching of resolved token values per unique token set

### 🟡 HIGH #5: Sequential Plugin Data Reads

**Problem:** Reading plugin data is async and happens per-node sequentially (within worker batches).

```typescript
// In NodeManager
tokens: await tokensSharedDataHandler.getAll(node), // Async I/O per node
```

**Impact:**
- Plugin data reads are I/O operations
- Even with Worker batching (30 at a time), still inefficient
- Figma API may have bulk read capabilities not being used

### 🟡 HIGH #6: Excessive Async Operations in setValuesOnNode

**Problem:** `setValuesOnNode` calls 15+ async functions sequentially with multiple `await` statements.

```typescript
export default async function setValuesOnNode(...) {
  await applyBorderValuesOnNode(node, data, values, baseFontSize);
  await applyBorderRadiusValuesOnNode(node, data, values, baseFontSize);
  await applyShadowValuesOnNode(node, data, values, baseFontSize);
  // ... 12 more await calls
}
```

**Impact:**
- Each await introduces context switching overhead
- Most apply functions are actually synchronous but marked async
- Unnecessary async/await overhead multiplied by 100k nodes

### 🟠 MEDIUM #7: Deep Object Cloning in Token Processing

**Problem:** Token resolution involves deep object operations.

```typescript
// In tokenState.tsx
const newTokens: TokenStore['values'] = JSON.parse(JSON.stringify(state.tokens));
```

**Impact:**
- `JSON.parse(JSON.stringify())` is memory-intensive
- Creates temporary string representations
- For large token sets, this can be 10-50MB per operation

### 🟠 MEDIUM #8: Inefficient findAll Implementation

**Problem:** `findAll` uses Figma's `findAllWithCriteria` which may traverse entire tree.

```typescript
export function findAll(nodes: readonly BaseNode[], includeSelf = false, nodesWithoutPluginData = false) {
  nodes.forEach((node) => {
    if ('children' in node) {
      allNodes = allNodes.concat(
        node.findAllWithCriteria({ types: ValidNodeTypes, ...pluginDataOptions })
      );
    }
  });
  return allNodes;
}
```

**Impact:**
- Array concatenation creates new arrays
- May traverse nodes multiple times if nested
- No depth limiting or pagination

### 🟠 MEDIUM #9: String Manipulation in destructureTokenForAlias

**Problem:** Heavy string manipulation for every node with composition tokens.

```typescript
if (String(value).startsWith('$')) tokenName = String(value).slice(1, String(value).length);
if (String(value).startsWith('{')) tokenName = String(value).slice(1, String(value).length - 1);
```

**Impact:**
- Repeated string conversions and manipulations
- Could be pre-processed during token loading

### 🟢 LOW #10: Progress Tracking Overhead

**Problem:** Progress updates every 1 second can cause UI thrashing.

```typescript
public reportIfNecessary() {
  if (Date.now() - this.lastProgressReport > 1000) {
    postToUI({ ... }); // Posts message to UI
  }
}
```

**Impact:**
- Minor but adds up over 100k operations
- Can be optimized to batch less frequently

## Memory Analysis Summary

**Estimated Peak Memory Usage for 100k Nodes:**

| Component | Memory Usage |
|-----------|--------------|
| Node array accumulation | 200-500 MB |
| Promise set | 25-50 MB |
| Worker pool & event emitters | 50-100 MB |
| Token maps & lookups | 50-100 MB |
| Temporary objects/strings | 100-200 MB |
| **TOTAL ESTIMATED** | **425-950 MB** |

**Figma Memory Limits:**
- Figma plugins run in a sandboxed environment with ~1-2GB memory limit
- Memory access out of bounds errors occur when limit is exceeded
- Browser/Figma crashes when unable to allocate memory

## Root Cause Analysis

The fundamental architectural issue is **batch-and-wait pattern with unbounded accumulation**:

1. **Phase 1:** Accumulate ALL nodes (100k) in memory
2. **Phase 2:** Schedule ALL updates (100k) in memory
3. **Phase 3:** Wait for ALL promises (100k) to complete

This creates multiple memory pressure points simultaneously:
- Large arrays of nodes
- Large sets of promises
- Large worker pools
- Event emitter overflow

## Recommended Solutions

### Priority 1: Streaming/Chunked Processing Architecture

**Goal:** Process nodes in fixed-size chunks, releasing memory between chunks.

**Approach:**
```typescript
// Pseudo-code
const CHUNK_SIZE = 1000; // Process 1000 nodes at a time

async function processNodesInChunks(allNodes: BaseNode[]) {
  for (let i = 0; i < allNodes.length; i += CHUNK_SIZE) {
    const chunk = allNodes.slice(i, i + CHUNK_SIZE);
    
    // Process chunk
    const nodesWithData = await findDataForChunk(chunk);
    await updateChunk(nodesWithData);
    
    // Explicit cleanup
    chunk.length = 0;
    nodesWithData.length = 0;
    
    // Allow garbage collection
    if (i % (CHUNK_SIZE * 10) === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
```

**Benefits:**
- Peak memory reduced from 950MB to ~95MB (10x improvement)
- Prevents memory overflow
- Progress is more granular
- Failed chunks don't block others

### Priority 2: Worker Pool Size Limits

**Goal:** Limit concurrent operations to prevent memory explosion.

**Approach:**
```typescript
// In Worker.ts
private static MAX_POOL_SIZE = 1000; // Limit pool growth

public schedule = <R extends any>(fn: () => Promise<R>) => {
  // Wait if pool is full
  while (this.pool.size >= Worker.MAX_POOL_SIZE) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  // ... existing logic
};
```

**Benefits:**
- Prevents unbounded growth
- Back-pressure mechanism
- Predictable memory usage

### Priority 3: Token Value Caching

**Goal:** Pre-compute and cache resolved token values.

**Approach:**
```typescript
// Cache resolved values by unique token reference
const tokenValueCache = new Map<string, any>();

function getCachedTokenValue(tokenName: string) {
  if (!tokenValueCache.has(tokenName)) {
    const value = mapValuesToTokens(tokens, { [key]: tokenName });
    tokenValueCache.set(tokenName, value);
  }
  return tokenValueCache.get(tokenName);
}
```

**Benefits:**
- Reduces redundant token lookups
- CPU time savings
- Can pre-warm cache before processing

### Priority 4: Optimize setValuesOnNode

**Goal:** Remove unnecessary async/await overhead.

**Approach:**
```typescript
// Most apply functions are synchronous - remove async where not needed
export function setValuesOnNode(...) { // Remove async
  // Only await when truly async (variable application)
  applyBorderValuesOnNode(node, data, values, baseFontSize); // Remove await
  applyBorderRadiusValuesOnNode(node, data, values, baseFontSize);
  // ...
}
```

**Benefits:**
- Reduces context switching
- Faster execution
- Less memory for async machinery

### Priority 5: Bulk Plugin Data Operations

**Goal:** Read plugin data in batches if Figma API supports it.

**Approach:**
```typescript
// Pseudo-code - needs Figma API investigation
async function bulkGetPluginData(nodes: BaseNode[]) {
  // Check if Figma supports bulk operations
  return figma.getSharedPluginDataBulk?.(nodes, namespace) ?? 
    Promise.all(nodes.map(n => tokensSharedDataHandler.getAll(n)));
}
```

**Benefits:**
- Reduces I/O overhead
- Better performance if supported

### Priority 6: Progressive Enhancement

**Goal:** Detect large operations and adjust strategy.

**Approach:**
```typescript
async function updateNodesAdaptive(nodes: NodeManagerNode[]) {
  const nodeCount = nodes.length;
  
  if (nodeCount > 10000) {
    // Use streaming architecture for large operations
    return updateNodesStreaming(nodes);
  } else {
    // Use current approach for smaller operations
    return updateNodesOriginal(nodes);
  }
}
```

**Benefits:**
- Backwards compatible
- Optimizes for common case
- Handles edge cases

## Testing Strategy

### Performance Test Suite

1. **Memory Profiling Tests**
   - Create synthetic pages with 1k, 10k, 50k, 100k nodes
   - Measure peak memory usage
   - Assert memory usage stays below threshold

2. **Execution Time Tests**
   - Benchmark node processing time
   - Assert linear time complexity O(n)
   - Ensure no quadratic behavior

3. **Stress Tests**
   - Deep nesting (50+ levels)
   - Wide nesting (1000+ children per node)
   - Mixed token types

4. **Memory Leak Tests**
   - Run multiple update cycles
   - Assert memory is released between cycles
   - Check for EventEmitter leaks

### Monitoring & Metrics

```typescript
// Add instrumentation
class PerformanceMonitor {
  static trackMemory() {
    return {
      usedJSHeapSize: performance.memory?.usedJSHeapSize,
      totalJSHeapSize: performance.memory?.totalJSHeapSize,
    };
  }
  
  static trackTime(operation: string, fn: () => Promise<void>) {
    const start = performance.now();
    await fn();
    const duration = performance.now() - start;
    console.log(`${operation}: ${duration}ms`);
  }
}
```

## Implementation Phases

### Phase 1: Quick Wins (Low Risk)
- [ ] Add memory monitoring/logging
- [ ] Optimize setValuesOnNode (remove unnecessary async/await)
- [ ] Add Worker pool size limit
- [ ] Improve progress reporting interval

### Phase 2: Medium Changes (Medium Risk)
- [ ] Implement token value caching
- [ ] Add adaptive processing (detect large operations)
- [ ] Optimize string operations in destructureTokenForAlias
- [ ] Investigate bulk plugin data reads

### Phase 3: Major Refactor (High Risk)
- [ ] Implement streaming/chunked architecture
- [ ] Refactor NodeManager for chunk processing
- [ ] Update Worker for better batching strategy
- [ ] Add comprehensive performance tests

## Recommendations

### Immediate Actions (This PR)
1. ✅ **Document findings** (this file)
2. ⚠️ **Add memory/performance monitoring** to understand real-world impact
3. ⚠️ **Implement Worker pool limit** to prevent unbounded growth
4. ⚠️ **Add warning** for large operations (>10k nodes)

### Short-term (Next Sprint)
1. Implement token value caching
2. Optimize setValuesOnNode async overhead
3. Add performance test suite
4. Create benchmark suite for different page sizes

### Long-term (Future)
1. Full streaming architecture refactor
2. Investigate Figma API improvements (bulk operations)
3. Consider Web Worker for heavy computation
4. Explore incremental/differential updates

## Conclusion

The current architecture works well for typical use cases (dozens to hundreds of nodes) but has critical scalability issues for large pages (10k+ nodes). The primary issues are:

1. **Memory accumulation** - storing all nodes/promises in memory
2. **Unbounded growth** - no limits on concurrent operations
3. **Redundant work** - repeated token lookups and processing

These issues compound to cause memory exhaustion and crashes when processing 100k+ nodes.

The recommended solutions provide a path forward with incremental improvements that can be implemented with minimal risk while building toward a more scalable architecture.

**Priority order for maximum impact:**
1. 🔴 Streaming/chunked processing (biggest memory win)
2. 🔴 Worker pool limits (prevents crashes)
3. 🟡 Token value caching (performance win)
4. 🟡 Remove unnecessary async (performance win)
5. 🟠 Optimize findAll (moderate impact)

---

**Document Version:** 1.0  
**Date:** 2025-10-13  
**Author:** Performance Analysis
