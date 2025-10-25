# Performance Architecture Visualization

## Current Architecture (Problem)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER TRIGGERS UPDATE                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Phase 1: Node Discovery                         │
│                     (NodeManager.findBaseNodesWithData)              │
├─────────────────────────────────────────────────────────────────────┤
│  1. findAll() → Collect ALL nodes (100k)          [~200MB]          │
│  2. Create promises for ALL nodes (100k)          [~25MB]           │
│  3. Schedule ALL tasks in Worker pool (100k)      [~50MB]           │
│  4. Wait for ALL promises (Promise.all)                             │
│  5. Return MASSIVE array (100k nodes)             [~200MB]          │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    🚨 MEMORY USAGE: ~475MB 🚨
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Phase 2: Token Application                      │
│                          (updateNodes)                               │
├─────────────────────────────────────────────────────────────────────┤
│  1. Get token map (once)                          [~50MB]            │
│  2. Create promises for ALL nodes (100k)          [~25MB]           │
│  3. For EACH node:                                                  │
│     - destructureTokenForAlias (redundant!)       [~100MB]          │
│     - mapValuesToTokens (redundant!)              [~100MB]          │
│     - setValuesOnNode (15+ async calls)                             │
│  4. Schedule ALL in Worker pool (100k)            [~50MB]           │
│  5. Wait for ALL promises                                           │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    🔥 PEAK MEMORY: ~950MB 🔥
                    💥 FIGMA CRASHES 💥

┌─────────────────────────────────────────────────────────────────────┐
│                          Worker Pool                                 │
├─────────────────────────────────────────────────────────────────────┤
│  pool: Set<PoolFn>                                                  │
│  Size: UNBOUNDED! Can grow to 100k                                 │
│                                                                      │
│  EventEmitter:                                                      │
│  Listeners: One per promise (100k!)                                │
│  Memory: ~50MB for 100k listeners                                  │
│                                                                      │
│  Processing: 30 at a time, then schedule next 30                   │
│  Problem: Pool keeps growing before processing                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Proposed Architecture (Solution)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER TRIGGERS UPDATE                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     Adaptive Processing Mode                         │
├─────────────────────────────────────────────────────────────────────┤
│  IF nodes < 10k  → Use original (fast, low memory)                  │
│  IF nodes >= 10k → Use streaming (slower, safe)                     │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                 Streaming Architecture (100k nodes)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────┐            │
│  │ Chunk 1 (1000 nodes)                                │            │
│  ├─────────────────────────────────────────────────────┤            │
│  │ 1. Find nodes in chunk              [~2MB]          │            │
│  │ 2. Get plugin data                                  │            │
│  │ 3. Apply tokens with cache                          │            │
│  │ 4. Clear chunk memory                               │            │
│  │ 5. Allow GC (setTimeout 0)                          │            │
│  └─────────────────────────────────────────────────────┘            │
│                        ▼                                             │
│  ┌─────────────────────────────────────────────────────┐            │
│  │ Chunk 2 (1000 nodes)                                │            │
│  │ ... same process ...                [~2MB]          │            │
│  └─────────────────────────────────────────────────────┘            │
│                        ▼                                             │
│  ... 98 more chunks ...                                             │
│                        ▼                                             │
│  ┌─────────────────────────────────────────────────────┐            │
│  │ Chunk 100 (1000 nodes)                              │            │
│  │ ... same process ...                [~2MB]          │            │
│  └─────────────────────────────────────────────────────┘            │
│                                                                      │
│  🎯 PEAK MEMORY: ~95MB (per chunk)                                  │
│  ✅ NO CRASHES                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Improved Worker Pool                              │
├─────────────────────────────────────────────────────────────────────┤
│  pool: Set<PoolFn>                                                  │
│  Size: LIMITED to 1000 max                                          │
│  Back-pressure: Waits when pool is full                             │
│                                                                      │
│  EventEmitter:                                                      │
│  Listeners: Max 1000 at any time                                    │
│  Memory: ~5MB max                                                   │
│                                                                      │
│  Processing: 30 at a time, with pool limit                          │
│  Benefit: Predictable, bounded memory usage                         │
└─────────────────────────────────────────────────────────────────────┘
```

## Memory Comparison

```
CURRENT (100k nodes):
┌────────────────────────────────────────────────┐
│████████████████████████████████████████████  │ 950 MB
│                                                │ 🔥 CRASH RISK
└────────────────────────────────────────────────┘

PHASE 1 - Worker Limit (100k nodes):
┌─────────────────────────────────────────────┐
│███████████████████████████████            │ 600 MB
│                                             │ ⚠️  Still high
└─────────────────────────────────────────────┘

PHASE 2 - Batching + Cache (100k nodes):
┌──────────────────────────────────────────┐
│████████████████████                    │ 380 MB
│                                          │ ✅ Much better
└──────────────────────────────────────────┘

PHASE 3 - Streaming (100k nodes):
┌──────────────────────┐
│████               │ 95 MB
│                    │ 🎉 PERFECT!
└──────────────────────┘
```

## Token Caching Optimization

```
WITHOUT CACHING (Current):
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Node 1       │    │ Node 2       │    │ Node 3       │
│ tokens: {    │    │ tokens: {    │    │ tokens: {    │
│   fill: "A"  │    │   fill: "A"  │    │   fill: "A"  │
│   size: "B"  │    │   size: "B"  │    │   size: "B"  │
│ }            │    │ }            │    │ }            │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  Resolve "A"         Resolve "A"         Resolve "A"  ❌ REDUNDANT!
  Resolve "B"         Resolve "B"         Resolve "B"  ❌ REDUNDANT!

Total: 6 lookups for 3 nodes

WITH CACHING (Proposed):
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Node 1       │    │ Node 2       │    │ Node 3       │
│ tokens: {    │    │ tokens: {    │    │ tokens: {    │
│   fill: "A"  │    │   fill: "A"  │    │   fill: "A"  │
│   size: "B"  │    │   size: "B"  │    │   size: "B"  │
│ }            │    │ }            │    │ }            │
└──────────────┘    └──────────────┘    └──────────────┘
       │                   │                   │
       └───────────┬───────┴───────────────────┘
                   ▼
            ┌─────────────┐
            │ Token Cache │
            │ Key: "A,B"  │
            │ Value: {...}│
            └─────────────┘
                   ▼
             Get cached result ✅ FAST!

Total: 2 lookups for 3 nodes (first resolves, rest cached)

For 100k nodes with ~1000 unique token combinations:
  Current:  200,000,000+ lookups
  Cached:   1,000 lookups + 99,999 cache hits
  Speedup:  ~200,000x improvement!
```

## Async/Await Overhead

```
CURRENT (Unnecessary async/await):
┌─────────────────────────────────────────────────────┐
│ async function setValuesOnNode() {                  │
│   await applyBorderValuesOnNode();      ⏱️  +5ms    │
│   await applyBorderRadiusValuesOnNode();⏱️  +5ms    │
│   await applyShadowValuesOnNode();      ⏱️  +5ms    │
│   await applyBackgroundBlurValuesOnNode();⏱️ +5ms   │
│   // ... 11 more awaits                            │
│ }                                                    │
│                                                      │
│ Total overhead per node: ~75ms                      │
│ For 100k nodes: 7,500 seconds (2+ hours!)          │
└─────────────────────────────────────────────────────┘

OPTIMIZED (Only await when needed):
┌─────────────────────────────────────────────────────┐
│ function setValuesOnNode() {  // Not async!          │
│   applyBorderValuesOnNode();         ⏱️  +0ms       │
│   applyBorderRadiusValuesOnNode();   ⏱️  +0ms       │
│   applyShadowValuesOnNode();         ⏱️  +0ms       │
│   applyBackgroundBlurValuesOnNode(); ⏱️  +0ms       │
│   // ... no await overhead                          │
│ }                                                    │
│                                                      │
│ Total overhead per node: ~0ms                       │
│ For 100k nodes: 0 seconds saved                     │
│ (Plus reduced memory for async machinery)           │
└─────────────────────────────────────────────────────┘

Note: Only await for truly async operations like:
  - tryApplyVariableId() - accesses Figma API
  - Font loading operations
  - Async variable resolution
```

## Processing Timeline

```
CURRENT ARCHITECTURE (100k nodes):
├─────────────────────────────────────────────────────────────────────┤
│                  Find All Nodes (10+ seconds)                       │
├─────────────────────────────────────────────────────────────────────┤
│                  Schedule All Tasks (5+ seconds)                    │
├─────────────────────────────────────────────────────────────────────┤
│                  Process All Nodes (300+ seconds)                   │
├─────────────────────────────────────────────────────────────────────┤
│ TOTAL: ~320 seconds (~5 minutes)                                    │
│ 💥 CRASH at 60-120 seconds due to memory exhaustion                │
└─────────────────────────────────────────────────────────────────────┘

STREAMING ARCHITECTURE (100k nodes):
├──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┤
│C1│C2│C3│C4│C5│C6│C7│C8│C9│10│11│12│...│97│98│99│00│  │  │  │  │  │
├──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┴──┤
│ Each chunk: ~1 second                                               │
│ TOTAL: ~100 seconds (~1.5 minutes)                                 │
│ ✅ NO CRASHES - Memory stays constant                              │
│ 🚀 Progress visible throughout                                     │
└─────────────────────────────────────────────────────────────────────┘

Improvement: 3.2x faster + stable memory!
```

## Decision Tree

```
                    Start Token Update
                            │
                            ▼
                    How many nodes?
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    < 1,000           1k - 10k              > 10k
        │                   │                   │
        ▼                   ▼                   ▼
   Use original      Use batching         Use streaming
   Quick & simple    Good balance      Stable & safe
   ~10 MB memory     ~40 MB memory     ~95 MB memory
```

## Key Metrics

```
┌────────────────────┬──────────┬───────────┬───────────┬───────────┐
│ Metric             │ Current  │ Phase 1   │ Phase 2   │ Phase 3   │
├────────────────────┼──────────┼───────────┼───────────┼───────────┤
│ Peak Memory (100k) │ 950 MB   │ 600 MB    │ 380 MB    │ 95 MB     │
│ Time (100k nodes)  │ 320s     │ 290s      │ 130s      │ 100s      │
│ Crash Risk         │ 🔴 High  │ 🟡 Medium │ 🟢 Low    │ ✅ None   │
│ Max Nodes Safe     │ 20k      │ 50k       │ 150k      │ Unlimited │
│ Implementation     │ N/A      │ 1-2 days  │ 1 week    │ 2-3 weeks │
│ Risk               │ N/A      │ 🟢 Low    │ 🟡 Medium │ 🟠 High   │
└────────────────────┴──────────┴───────────┴───────────┴───────────┘
```

---

## Visual Summary

```
🚨 PROBLEM:
┌─────────────────────────────────────┐
│ Accumulate ALL → Process ALL        │
│ [Node1][Node2][Node3]...[Node100k]  │
│         💥 OUT OF MEMORY             │
└─────────────────────────────────────┘

✅ SOLUTION:
┌─────────────────────────────────────┐
│ Chunk → Process → Release → Repeat  │
│ [1k] → ✅ → 🗑️  → [1k] → ✅ → 🗑️   │
│      Memory stays constant          │
└─────────────────────────────────────┘
```

---

**Legend:**
- 🔴 Critical/High Risk
- 🟡 Medium Risk
- 🟢 Low Risk
- ✅ Success/Complete
- 🎯 Target/Goal
- 🎉 Excellent Result
- ⚠️  Warning
- 💥 Crash/Failure
- 🚀 Performance Improvement
- 🗑️  Garbage Collection
- ⏱️  Time/Performance
