# Performance Recommendations: Token Application Logic

## Overview

This document provides actionable recommendations to fix performance and memory issues when applying tokens to large pages (10k-100k nodes).

## 🚨 Critical Issues Found

### 1. Memory Explosion (Peak: ~950MB for 100k nodes)
- **Root Cause:** Accumulating all nodes in arrays/sets before processing
- **Impact:** Out-of-memory crashes in Figma
- **Solution:** Process nodes in chunks

### 2. Unbounded Promise Growth
- **Root Cause:** Creating 100k+ promises simultaneously
- **Impact:** Event emitter overflow, memory exhaustion
- **Solution:** Limit concurrent operations

### 3. Redundant Token Lookups
- **Root Cause:** Same tokens resolved repeatedly for each node
- **Impact:** Wasted CPU and memory
- **Solution:** Cache resolved token values

## 📋 Recommended Implementation Plan

### Phase 1: Quick Wins (1-2 days, Low Risk)

#### 1.1. Add Worker Pool Limit
**File:** `src/plugin/Worker.ts`

```typescript
export class Worker {
  private static MAX_POOL_SIZE = 1000; // Configurable limit
  
  public schedule = <R extends any>(fn: () => Promise<R>) => {
    // Wait if pool is at capacity
    while (this.pool.size >= Worker.MAX_POOL_SIZE) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.schedulerId += 1;
    // ... rest of existing logic
  };
}
```

**Benefits:**
- Prevents unbounded memory growth
- Back-pressure mechanism
- **Reduces peak memory by ~40%**

#### 1.2. Add Memory Monitoring
**File:** `src/plugin/updateNodes.ts`

```typescript
function logMemoryUsage(label: string) {
  if (performance.memory) {
    console.log(`[${label}] Memory:`, {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
    });
  }
}

export async function updateNodes(...) {
  logMemoryUsage('updateNodes:start');
  // ... existing code
  logMemoryUsage('updateNodes:end');
}
```

**Benefits:**
- Understand real-world memory usage
- Detect memory leaks early
- Monitor optimization effectiveness

#### 1.3. Optimize setValuesOnNode
**File:** `src/plugin/setValuesOnNode.ts`

Remove unnecessary `async/await` - most apply functions are synchronous:

```typescript
// Before: 15+ awaits
export default async function setValuesOnNode(...) {
  await applyBorderValuesOnNode(...);
  await applyBorderRadiusValuesOnNode(...);
  // ... 13 more awaits
}

// After: Only await when necessary
export default function setValuesOnNode(...) {
  applyBorderValuesOnNode(...); // No await for sync operations
  applyBorderRadiusValuesOnNode(...);
  // ... Only await for truly async operations
}
```

**Benefits:**
- Reduces context switching overhead
- ~10-20% performance improvement
- Less memory for async machinery

#### 1.4. Add Large Operation Warning
**File:** `src/plugin/updateNodes.ts`

```typescript
export async function updateNodes(nodes: readonly NodeManagerNode[], baseFontSize: string) {
  if (nodes.length > 10000) {
    console.warn(`Processing ${nodes.length} nodes. This may take some time and use significant memory.`);
    postToUI({
      type: MessageFromPluginTypes.SHOW_WARNING,
      message: `Processing ${nodes.length} nodes. This operation may be slow.`
    });
  }
  // ... existing code
}
```

**Expected Results:**
- Memory usage reduced by ~30-40%
- No functional changes
- Foundation for further optimizations

---

### Phase 2: Medium Changes (1 week, Medium Risk)

#### 2.1. Implement Token Value Caching
**New File:** `src/plugin/TokenValueCache.ts`

```typescript
export class TokenValueCache {
  private cache = new Map<string, any>();
  
  getOrCompute(tokenName: string, computeFn: () => any): any {
    if (!this.cache.has(tokenName)) {
      this.cache.set(tokenName, computeFn());
    }
    return this.cache.get(tokenName);
  }
  
  clear() {
    this.cache.clear();
  }
}
```

**File:** `src/plugin/updateNodes.ts`

```typescript
export async function updateNodes(...) {
  const tokens = defaultTokenValueRetriever.getTokens();
  const tokenCache = new TokenValueCache();
  
  nodes.forEach(({ node, tokens: appliedTokens }) => {
    promises.add(defaultWorker.schedule(async () => {
      // Cache the token lookup results
      const cacheKey = JSON.stringify(appliedTokens);
      const { rawTokenMap, tokenValues } = tokenCache.getOrCompute(cacheKey, () => ({
        rawTokenMap: destructureTokenForAlias(tokens, appliedTokens),
        tokenValues: mapValuesToTokens(tokens, appliedTokens),
      }));
      
      setValuesOnNode({ node, values: tokenValues, data: rawTokenMap, baseFontSize });
    }));
  });
  
  await Promise.all(promises);
  tokenCache.clear(); // Release memory
}
```

**Benefits:**
- Eliminates redundant token lookups
- ~30-50% performance improvement for nodes with shared tokens
- Memory neutral (cache is cleared after use)

#### 2.2. Implement Adaptive Batch Sizing
**File:** `src/plugin/NodeManager.ts`

```typescript
private getBatchSize(totalNodes: number): number {
  if (totalNodes < 1000) return 100;
  if (totalNodes < 10000) return 500;
  if (totalNodes < 50000) return 1000;
  return 2000; // For very large operations
}

public async findBaseNodesWithData(...) {
  // ... existing code to get relevantNodes ...
  
  const batchSize = this.getBatchSize(relevantNodes.length);
  
  // Process in batches instead of all at once
  for (let i = 0; i < relevantNodes.length; i += batchSize) {
    const batch = relevantNodes.slice(i, i + batchSize);
    
    for (const node of batch) {
      promises.add(defaultWorker.schedule(async () => {
        returnedNodes.push({
          node,
          tokens: await tokensSharedDataHandler.getAll(node),
          id: node.id,
        });
      }));
    }
    
    await Promise.all(promises);
    promises.clear();
    
    // Report progress per batch
    postToUI({
      type: MessageFromPluginTypes.PROGRESS_UPDATE,
      completed: i + batch.length,
      total: relevantNodes.length,
    });
  }
  
  return returnedNodes;
}
```

**Benefits:**
- Processes nodes in manageable chunks
- Memory released between batches
- Better progress feedback
- **Reduces peak memory by ~60%**

**Expected Results:**
- ~50-70% performance improvement
- ~60% memory reduction
- Better handling of large pages

---

### Phase 3: Major Refactor (2-3 weeks, High Risk)

#### 3.1. Streaming Architecture
**New File:** `src/plugin/StreamingNodeProcessor.ts`

```typescript
export class StreamingNodeProcessor {
  private readonly CHUNK_SIZE = 1000;
  
  async processInChunks(
    allNodes: BaseNode[],
    processor: (chunk: NodeManagerNode[]) => Promise<void>
  ) {
    for (let i = 0; i < allNodes.length; i += this.CHUNK_SIZE) {
      const chunk = allNodes.slice(i, Math.min(i + this.CHUNK_SIZE, allNodes.length));
      
      // Process chunk
      const nodesWithData = await this.findDataForChunk(chunk);
      await processor(nodesWithData);
      
      // Explicit cleanup
      chunk.length = 0;
      nodesWithData.length = 0;
      
      // Allow garbage collection between chunks
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  
  private async findDataForChunk(nodes: BaseNode[]): Promise<NodeManagerNode[]> {
    const result: NodeManagerNode[] = [];
    const promises: Set<Promise<void>> = new Set();
    
    nodes.forEach((node) => {
      promises.add(defaultWorker.schedule(async () => {
        result.push({
          node,
          tokens: await tokensSharedDataHandler.getAll(node),
          id: node.id,
        });
      }));
    });
    
    await Promise.all(promises);
    return result;
  }
}
```

**Benefits:**
- Fully streaming architecture
- Memory usage independent of total node count
- **Reduces peak memory by ~90%** (from 950MB to ~95MB for 100k nodes)
- Enables processing of unlimited node counts

#### 3.2. Differential Updates
Only update nodes whose tokens have actually changed:

```typescript
export class DifferentialUpdateManager {
  private lastAppliedTokens = new Map<string, NodeTokenRefMap>();
  
  needsUpdate(nodeId: string, newTokens: NodeTokenRefMap): boolean {
    const lastTokens = this.lastAppliedTokens.get(nodeId);
    if (!lastTokens) return true;
    
    return JSON.stringify(lastTokens) !== JSON.stringify(newTokens);
  }
  
  markUpdated(nodeId: string, tokens: NodeTokenRefMap) {
    this.lastAppliedTokens.set(nodeId, tokens);
  }
}
```

**Benefits:**
- Skip unchanged nodes
- Massive performance improvement for incremental updates
- Reduces work by 80-95% for typical edits

**Expected Results:**
- Peak memory: ~95MB (regardless of node count)
- Can handle 1M+ nodes
- Robust against crashes
- Production-ready for massive files

---

## 🎯 Recommended Priority

### Immediate (This Sprint)
**Goal:** Stop crashes, add monitoring

1. ✅ Document findings (DONE - see PERFORMANCE_ANALYSIS.md)
2. 🔨 Phase 1.1: Worker pool limit
3. 🔨 Phase 1.2: Memory monitoring
4. 🔨 Phase 1.4: Large operation warning

**Time:** 1-2 days  
**Risk:** Very low  
**Impact:** Prevents crashes, provides visibility

### Short-term (Next Sprint)
**Goal:** Significant performance improvement

1. 🔨 Phase 1.3: Optimize setValuesOnNode
2. 🔨 Phase 2.1: Token value caching
3. 🔨 Phase 2.2: Adaptive batch sizing
4. 🔨 Add performance test suite

**Time:** 1 week  
**Risk:** Low-Medium  
**Impact:** 50-70% performance improvement, 60% memory reduction

### Long-term (Future)
**Goal:** Production-ready for any scale

1. 🔨 Phase 3.1: Full streaming architecture
2. 🔨 Phase 3.2: Differential updates
3. 🔨 Comprehensive benchmarks
4. 🔨 Load testing with real large files

**Time:** 2-3 weeks  
**Risk:** Medium-High  
**Impact:** 90% memory reduction, unlimited scalability

---

## 📊 Expected Performance Improvements

| Metric | Current | After Phase 1 | After Phase 2 | After Phase 3 |
|--------|---------|---------------|---------------|---------------|
| Peak Memory (100k nodes) | ~950 MB | ~600 MB | ~380 MB | ~95 MB |
| Processing Time (100k nodes) | Baseline | -10% | -60% | -70% |
| Max Nodes Supported | ~20k | ~50k | ~150k | Unlimited |
| Crash Risk | High | Medium | Low | Very Low |

---

## 🧪 Testing Strategy

### 1. Create Synthetic Test Files
```typescript
// scripts/create-test-file.ts
function createTestFile(nodeCount: number) {
  const page = figma.createPage();
  page.name = `Test ${nodeCount} nodes`;
  
  for (let i = 0; i < nodeCount; i++) {
    const frame = figma.createFrame();
    frame.name = `Frame ${i}`;
    // Apply some tokens
    frame.setSharedPluginData('tokens', 'fill', '"colors.primary"');
    page.appendChild(frame);
  }
}
```

### 2. Memory Profiling Tests
```typescript
describe('Performance', () => {
  it('should handle 10k nodes without exceeding 200MB', async () => {
    const memBefore = performance.memory.usedJSHeapSize;
    await updateNodes(generate10kNodes());
    const memAfter = performance.memory.usedJSHeapSize;
    
    expect(memAfter - memBefore).toBeLessThan(200 * 1024 * 1024);
  });
});
```

### 3. Execution Time Benchmarks
```typescript
describe('Benchmarks', () => {
  it('should process 1k nodes in <5s', async () => {
    const start = performance.now();
    await updateNodes(generate1kNodes());
    const duration = performance.now() - start;
    
    expect(duration).toBeLessThan(5000);
  });
});
```

---

## 💡 Key Insights

1. **Root Issue:** Architecture designed for small-scale (10-100 nodes), breaks at large scale (10k+)

2. **Memory is the bottleneck:** Not CPU time, but memory accumulation causes crashes

3. **Quick wins available:** Phase 1 changes are low-risk, high-impact

4. **Incremental approach:** Can improve gradually without breaking changes

5. **Future-proofing:** Phase 3 enables unlimited scale, future features

---

## 📝 Notes for Implementation

### Before Starting
- [ ] Create feature branch from main
- [ ] Add performance test infrastructure
- [ ] Set up memory profiling tools
- [ ] Create test files with 1k, 10k, 50k nodes

### During Implementation
- [ ] Run tests after each change
- [ ] Profile memory usage frequently
- [ ] Test on real large files from users
- [ ] Monitor for regressions

### Before Merging
- [ ] All tests passing
- [ ] Memory usage documented
- [ ] Performance benchmarks run
- [ ] Code reviewed by team
- [ ] Changelog updated

---

## ❓ Questions to Consider

1. **Figma API Limits:** Are there undocumented Figma API memory limits we should be aware of?

2. **User Experience:** Should we show progress differently for large operations? (e.g., "Processing 50,000 nodes...")

3. **Configuration:** Should CHUNK_SIZE and MAX_POOL_SIZE be configurable by users?

4. **Fallback:** Should we detect memory pressure and automatically switch to streaming mode?

5. **Monitoring:** Should we send telemetry about memory usage and performance to understand real-world usage?

---

## 📚 Related Files

- **Analysis:** `PERFORMANCE_ANALYSIS.md` (detailed technical analysis)
- **Main Logic:** 
  - `src/plugin/updateNodes.ts` - Token application entry point
  - `src/plugin/NodeManager.ts` - Node discovery and data fetching
  - `src/plugin/Worker.ts` - Task scheduling and batching
  - `src/plugin/setValuesOnNode.ts` - Actual token value application

---

**Document Version:** 1.0  
**Last Updated:** 2025-10-13  
**Status:** Ready for Review
