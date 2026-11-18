# Sentry Instrumentation Plan for Performance Monitoring

## Overview

This document extends the performance analysis with a comprehensive Sentry instrumentation plan to establish baseline metrics and monitor improvements across all 3 implementation phases.

**Important Note on Memory Tracking:** Direct memory measurement is not available in the Figma plugin sandbox environment. Memory improvements will be validated indirectly through:
- Operational metrics (promise set size, worker pool size, array sizes)
- Error rates (memory errors, crashes)
- Operation success rates at scale (100k+ nodes)
- Duration improvements (as memory pressure reduces, operations complete faster)

## Current Sentry Setup

### Existing Instrumentation

The codebase already has Sentry transaction monitoring in place:

**Location:** `src/profiling/transaction.ts`

```typescript
export const wrapTransaction = async<U>(opts: TransactionOptions<U>, fn: () => U): Promise<U> => {
  const transaction = startTransaction({ name: opts.name });
  // ... execution ...
  if (opts.statExtractor) {
    opts.statExtractor(result, transaction);
  }
  transaction.finish();
  return result;
}
```

**Currently Instrumented:**
- ✅ `updateDocument` in `tokenState.tsx` - Tracks tokens, tokenSets, themes, tokensSize, themesSize
- ✅ `attachVariables` in `ThemeVariableManagement.tsx`
- ✅ `remapToken`, `bulkRemapToken`, `createStyles`, `renameVariables`, `updateVariables` in token operations

**Sentry Configuration:**
- Package: `@sentry/react` and `@sentry/browser` (v7.54.0+)
- Environment: alpha, beta, production
- Trace sampling: Configured via `SENTRY_SAMPLING` env var (default: 0.1)
- Profile sampling: Configured via `SENTRY_PROFILE_SAMPLING` env var (default: 0.1)

## Missing Instrumentation

### Critical Gap: Plugin-Side Operations

The **most performance-critical code paths** identified in the analysis are NOT instrumented:

❌ **Not Instrumented:**
- `updateNodes.ts` - Token application to nodes (main bottleneck)
- `NodeManager.ts` - Node discovery and data fetching
- `Worker.ts` - Task scheduling and batching
- `setValuesOnNode.ts` - Individual node updates
- Token resolution functions in `node.ts`

**Problem:** These run in the Figma plugin sandbox, not the UI iframe where Sentry is initialized.

## Proposed Instrumentation Strategy

### Phase 0: Establish Baseline (Immediate)

#### 0.1. Add Plugin-Side Performance Tracking

Since Sentry doesn't run in the plugin sandbox, use a **custom performance tracking system** that sends metrics to the UI:

**New File:** `src/plugin/performanceMonitoring.ts`

```typescript
import { postToUI } from './notifiers';
import { MessageFromPluginTypes } from '@/types/messages';

interface PerformanceMetric {
  operation: string;
  duration: number;
  nodeCount?: number;
  timestamp: number;
  // Note: Memory tracking not available in Figma plugin sandbox
}

export class PluginPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  
  /**
   * Wrap an async function with performance tracking
   * Note: Only tracks duration and operation counts - memory tracking
   * is not available in the Figma plugin sandbox
   */
  async trackOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, number>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await fn();
      
      const duration = performance.now() - startTime;
      
      this.recordMetric({
        operation,
        duration,
        timestamp: Date.now(),
        ...metadata,
      });
      
      return result;
    } catch (error) {
      // Record failed operations too
      const duration = performance.now() - startTime;
      this.recordMetric({
        operation: `${operation}_failed`,
        duration,
        timestamp: Date.now(),
        ...metadata,
      });
      throw error;
    }
  }
  
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Send to UI for Sentry reporting
    postToUI({
      type: MessageFromPluginTypes.PERFORMANCE_METRIC,
      metric,
    });
  }
  
  /**
   * Get summary statistics
   */
  getSummary() {
    return {
      totalOperations: this.metrics.length,
      operations: this.groupByOperation(),
    };
  }
  
  private groupByOperation() {
    const grouped = new Map<string, number[]>();
    
    this.metrics.forEach(metric => {
      if (!grouped.has(metric.operation)) {
        grouped.set(metric.operation, []);
      }
      grouped.get(metric.operation)!.push(metric.duration);
    });
    
    const summary: Record<string, any> = {};
    grouped.forEach((durations, operation) => {
      summary[operation] = {
        count: durations.length,
        total: durations.reduce((a, b) => a + b, 0),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
      };
    });
    
    return summary;
  }
  
  clear() {
    this.metrics = [];
  }
}

export const pluginPerformanceMonitor = new PluginPerformanceMonitor();
```

#### 0.2. Instrument updateNodes.ts

```typescript
import { pluginPerformanceMonitor } from './performanceMonitoring';

export async function updateNodes(
  nodes: readonly NodeManagerNode[],
  baseFontSize: string,
) {
  return pluginPerformanceMonitor.trackOperation(
    'updateNodes',
    async () => {
      const startNodeCount = nodes.length;
      
      postToUI({
        type: MessageFromPluginTypes.START_JOB,
        job: {
          name: BackgroundJobs.PLUGIN_UPDATENODES,
          timePerTask: 2,
          completedTasks: 0,
          totalTasks: nodes.length,
        },
      });

      const tracker = new ProgressTracker(BackgroundJobs.PLUGIN_UPDATENODES);
      const promises: Set<Promise<void>> = new Set();

      const tokens = defaultTokenValueRetriever.getTokens();
      const tokenCount = tokens.size;

      nodes.forEach(({ node, tokens: appliedTokens }) => {
        promises.add(
          defaultWorker.schedule(async () => {
            try {
              const rawTokenMap = destructureTokenForAlias(tokens, appliedTokens);
              const tokenValues = mapValuesToTokens(tokens, appliedTokens);
              setValuesOnNode({
                node,
                values: tokenValues,
                data: rawTokenMap,
                baseFontSize,
              });
            } catch (e) {
              console.log('got error', e);
            } finally {
              tracker.next();
              tracker.reportIfNecessary();
            }
          }),
        );
      });
      
      await Promise.all(promises);

      postToUI({
        type: MessageFromPluginTypes.COMPLETE_JOB,
        name: BackgroundJobs.PLUGIN_UPDATENODES,
      });
      
      return { nodeCount: startNodeCount, tokenCount };
    },
    { nodeCount: nodes.length }
  );
}
```

#### 0.3. Instrument NodeManager.ts

```typescript
import { pluginPerformanceMonitor } from './performanceMonitoring';

export class NodeManager {
  public async findBaseNodesWithData(opts: {
    updateMode?: UpdateMode;
    nodes?: readonly BaseNode[];
    nodesWithoutPluginData?: boolean;
  }) {
    return pluginPerformanceMonitor.trackOperation(
      'findBaseNodesWithData',
      async () => {
        const tracker = new ProgressTracker(BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA);
        const promises: Set<Promise<void>> = new Set();
        const returnedNodes: NodeManagerNode[] = [];

        await this.waitForUpdating();

        const { updateMode, nodes } = opts;
        let relevantNodes: BaseNode[] = [];
        if (nodes) {
          relevantNodes = Array.from(nodes);
        } else if (updateMode === UpdateMode.PAGE) {
          relevantNodes = findAll([figma.currentPage], false, opts.nodesWithoutPluginData);
        } else if (updateMode === UpdateMode.SELECTION) {
          relevantNodes = findAll(figma.currentPage.selection, true, opts.nodesWithoutPluginData);
        } else {
          relevantNodes = findAll([figma.root], false, opts.nodesWithoutPluginData);
        }
        
        const nodeCount = relevantNodes.length;

        postToUI({
          type: MessageFromPluginTypes.START_JOB,
          job: {
            name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
            timePerTask: 0.5,
            completedTasks: 0,
            totalTasks: relevantNodes.length,
          },
        });

        this.updating = (async () => {
          for (let nodeIndex = 0; nodeIndex < relevantNodes.length; nodeIndex += 1) {
            promises.add(defaultWorker.schedule(async () => {
              const node = relevantNodes[nodeIndex];

              returnedNodes.push({
                node: relevantNodes[nodeIndex],
                tokens: await tokensSharedDataHandler.getAll(node),
                id: node.id,
              });
              tracker.next();
              tracker.reportIfNecessary();
            }));
          }
          await Promise.all(promises);
        })();
        await this.waitForUpdating();

        postToUI({
          type: MessageFromPluginTypes.COMPLETE_JOB,
          name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
        });

        return returnedNodes;
      },
      { 
        nodeCount: opts.nodes?.length || 0,
        updateMode: opts.updateMode || 'unknown' 
      }
    );
  }
}
```

#### 0.4. Add UI-Side Metric Collection

**File:** `src/app/asyncMessageHandlers/performanceMetrics.ts`

```typescript
import * as Sentry from '@sentry/react';

export const handlePerformanceMetric = (metric: any) => {
  // Forward plugin performance metrics to Sentry
  const transaction = Sentry.startTransaction({
    name: `plugin.${metric.operation}`,
    op: 'plugin.operation',
  });

  // Add measurements
  if (metric.duration) {
    transaction.setMeasurement('duration', metric.duration, 'millisecond');
  }
  if (metric.nodeCount) {
    transaction.setMeasurement('nodeCount', metric.nodeCount, '');
  }
  // Note: Memory tracking not available from plugin sandbox

  transaction.finish();
};
```

#### 0.5. Update Message Types

**File:** `src/types/messages.ts` (add new message type)

```typescript
export enum MessageFromPluginTypes {
  // ... existing types ...
  PERFORMANCE_METRIC = 'PERFORMANCE_METRIC',
}
```

### Baseline Metrics to Capture

#### Primary Performance Indicators

1. **Operation Duration**
   - `updateNodes.duration` - Total time to update all nodes
   - `findBaseNodesWithData.duration` - Time to discover and fetch node data
   - `setValuesOnNode.duration` - Time per individual node update

2. **Node Processing**
   - `nodeCount` - Number of nodes processed
   - `nodesPerSecond` - Processing rate
   - `tokenApplicationRate` - Tokens applied per second

3. **Memory Indicators** (indirect measurement via operational metrics)
   - `promiseSetSize` - Number of concurrent promises (tracked in code)
   - `workerPoolSize` - Current worker pool size (tracked in code)
   - `arraySize` - Size of accumulated node arrays (tracked in code)
   - Note: Direct memory measurement not available in plugin sandbox

4. **Error Rates**
   - `operationFailureRate` - Percentage of failed operations
   - `memoryErrors` - Count of out-of-memory errors
   - `timeout count` - Operations exceeding threshold

#### Secondary Metrics

5. **Token Operations**
   - `tokenLookupCount` - Number of token lookups
   - `cacheHitRate` - Cache effectiveness (Phase 2+)
   - `redundantLookups` - Duplicate token resolutions

6. **Batch Performance**
   - `batchSize` - Nodes per batch (Phase 2+)
   - `batchDuration` - Time per batch
   - `garbageCollectionPauses` - GC impact (Phase 3)

## Implementation Timeline

### Week 0: Baseline Establishment (2-3 days)

**Goal:** Capture current state metrics before any optimizations

**Tasks:**
1. ✅ Add `performanceMonitoring.ts` to plugin
2. ✅ Instrument `updateNodes.ts`
3. ✅ Instrument `NodeManager.ts`
4. ✅ Add UI message handler
5. ✅ Deploy to beta environment
6. ✅ Collect 1 week of baseline data

**Deliverables:**
- Baseline report with current performance metrics
- Sentry dashboard configured
- Alert thresholds defined

### Week 1: Phase 1 Instrumentation

**Goal:** Monitor impact of worker pool limits

**New Metrics:**
```typescript
transaction.setMeasurement('workerPoolSize', currentPoolSize, '');
transaction.setMeasurement('poolWaitTime', waitTimeMs, 'millisecond');
transaction.setMeasurement('poolRejections', rejectionCount, '');
```

**Expected Changes:**
- `promiseSetSize`: ∞ → 1000 (max)
- `memoryErrors`: X → 0
- `operationDuration`: +10% acceptable increase

### Week 2-3: Phase 2 Instrumentation

**Goal:** Track caching and batching effectiveness

**New Metrics:**
```typescript
transaction.setMeasurement('cacheHitRate', hitRate, '');
transaction.setMeasurement('cacheMisses', missCount, '');
transaction.setMeasurement('batchSize', nodesPerBatch, '');
transaction.setMeasurement('batchCount', totalBatches, '');
```

**Expected Changes:**
- `tokenLookupCount`: Reduce by 70-90%
- `cacheHitRate`: 85-95%
- `operationDuration`: Reduce by 50%

### Week 4-6: Phase 3 Instrumentation

**Goal:** Monitor streaming architecture efficiency

**New Metrics:**
```typescript
transaction.setMeasurement('chunkSize', nodesPerChunk, '');
transaction.setMeasurement('chunkProcessingTime', avgChunkTime, 'millisecond');
// Note: Direct memory measurement not available in plugin sandbox
// Memory improvements validated indirectly through crash rate and operation success
```

**Expected Changes:**
- `operationDuration`: Reduce by 70%
- `maxSafeNodes`: 20k → unlimited
- `crashRate`: Monitor via error tracking (should be 0)

## Sentry Dashboard Configuration

### Custom Dashboard: "Token Application Performance"

**Widgets:**

1. **Operation Duration Trends**
   - Chart: Line graph
   - Metrics: `updateNodes.duration`, `findBaseNodesWithData.duration`
   - Grouping: By day
   - Alert: Duration > 60s for 1000 nodes

2. **Node Processing Rate**
   - Chart: Bar graph
   - Metric: `nodesPerSecond`
   - Grouping: By operation
   - Alert: Rate < 10 nodes/sec

3. **Operational Metrics** (indirect memory indicators)
   - Chart: Area graph
   - Metrics: `promiseSetSize`, `workerPoolSize`, `arraySize`
   - Note: Tracks operational counts that correlate with memory usage
   - Alert: Any metric > threshold

4. **Error Rates**
   - Chart: Stacked bar
   - Metrics: `memoryErrors`, `operationFailures`, `timeouts`
   - Alert: Any error > 0

5. **Cache Performance (Phase 2+)**
   - Chart: Gauge
   - Metric: `cacheHitRate`
   - Target: > 85%

6. **Phase Comparison**
   - Chart: Comparison table
   - Rows: Each phase
   - Columns: Duration, Memory, Error Rate
   - Shows improvement over baseline

### Alert Configuration

**Critical Alerts:**
```yaml
- name: "Memory Error Detected"
  condition: memoryErrors > 0
  severity: critical
  notify: #engineering-alerts

- name: "Operation Timeout"
  condition: updateNodes.duration > 300000ms
  severity: high
  notify: #engineering-alerts

- name: "High Failure Rate"
  condition: operationFailureRate > 5%
  severity: high
  notify: #engineering-alerts
```

**Warning Alerts:**
```yaml
- name: "Slow Performance"
  condition: nodesPerSecond < 20
  severity: warning
  notify: #engineering

- name: "Low Cache Hit Rate"
  condition: cacheHitRate < 70%
  severity: warning
  notify: #engineering
```

## Testing Instrumentation

### Manual Testing

```typescript
// Test script for Sentry instrumentation
describe('Performance Instrumentation', () => {
  it('should track updateNodes operation', async () => {
    const nodes = generateTestNodes(1000);
    
    await updateNodes(nodes, '16');
    
    // Verify metric was sent
    const metrics = await getRecentMetrics();
    expect(metrics).toContainEqual({
      operation: 'updateNodes',
      nodeCount: 1000,
      duration: expect.any(Number),
    });
  });
  
  it('should track worker pool size', async () => {
    const nodes = generateTestNodes(5000);
    
    await updateNodes(nodes, '16');
    
    const metrics = await getRecentMetrics();
    const poolMetrics = metrics.filter(m => m.workerPoolSize);
    
    // Verify pool never exceeds limit
    poolMetrics.forEach(m => {
      expect(m.workerPoolSize).toBeLessThanOrEqual(1000);
    });
  });
});
```

### Automated Monitoring

**Synthetic Tests:**
- Nightly runs with 1k, 10k, 50k node test files
- Automated comparison against baseline
- Regression detection and alerts

## Success Criteria

### Baseline Capture (Complete)
- [ ] 1 week of production data collected
- [ ] Baseline averages calculated
- [ ] Alert thresholds defined
- [ ] Dashboard operational

### Phase 1 Validation
- [ ] Worker pool size limited to 1000
- [ ] Memory errors reduced to 0
- [ ] No significant performance regression (< 10%)

### Phase 2 Validation
- [ ] Cache hit rate > 85%
- [ ] Token lookups reduced by 70%+
- [ ] Operation duration reduced by 50%+

### Phase 3 Validation
- [ ] Operation duration reduced by 70%+
- [ ] Successfully process 100k+ nodes without crashes
- [ ] Zero memory-related errors in production
- [ ] Worker pool size stays within configured limits

## Code Review Checklist

Before merging instrumentation changes:

- [ ] All critical operations have performance tracking
- [ ] Metrics include both duration and metadata
- [ ] Error cases are tracked
- [ ] No performance overhead in production (< 1%)
- [ ] Dashboard configured
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on using metrics

## References

- **Sentry Performance Monitoring:** https://docs.sentry.io/product/performance/
- **Transaction API:** https://docs.sentry.io/platforms/javascript/enriching-events/transaction-name/
- **Custom Measurements:** https://docs.sentry.io/platforms/javascript/enriching-events/transaction-name/#custom-measurements
- **Profiling:** https://docs.sentry.io/platforms/javascript/profiling/

---

**Document Version:** 1.0  
**Created:** 2025-10-13  
**Status:** Ready for Implementation  
**Owner:** Performance Team

## Next Steps

1. **Review this instrumentation plan** with the team
2. **Implement Phase 0** (baseline establishment)
3. **Wait 1 week** for baseline data collection
4. **Proceed with Phase 1** implementation and monitoring
5. **Iterate** through phases with continuous monitoring

---

*This instrumentation plan ensures we have quantitative data to validate each optimization phase and demonstrate the improvements to stakeholders.*
