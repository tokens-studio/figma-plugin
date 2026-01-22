# Implementation Roadmap

## Overview
Prioritized implementation plan for addressing findings from the comprehensive code review, with specific focus on performance optimization for large-scale usage (4000+ variables, 10,000+ nodes).

---

## 🔴 CRITICAL - Week 1 (Immediate Action)

### 1. Fix O(n²) Duplicate Detection Performance Bug

**File:** `src/utils/validateGroupName.ts:59`

**Impact:** 15-30 second hang with 4000 tokens

**Implementation:**
```typescript
// Current (O(n²))
let possibleDuplicates = newTokensAfterRename.filter((a) => 
  (newTokensAfterRename.filter((b) => a.name === b.name).length > 1) 
  && existingTokensAfterRename.some((t) => 
    t.name === a.name && t.type === a.type && t.value === a.value
  )
);

// Replace with (O(n))
const nameFrequency = new Map<string, number>();
newTokensAfterRename.forEach(token => {
  nameFrequency.set(token.name, (nameFrequency.get(token.name) || 0) + 1);
});

const existingTokenKeys = new Set(
  existingTokensAfterRename.map(t => `${t.name}|${t.type}|${JSON.stringify(t.value)}`)
);

let possibleDuplicates = newTokensAfterRename.filter(a => 
  nameFrequency.get(a.name)! > 1 
  && existingTokenKeys.has(`${a.name}|${a.type}|${JSON.stringify(a.value)}`)
);
```

**Testing:**
```typescript
// Add performance test
it('should validate 4000 tokens in < 100ms', () => {
  const tokens = generateTestTokens(4000);
  const start = performance.now();
  const result = validateGroupName(tokens, 'newGroup', 'oldGroup');
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(100);
});
```

**Effort:** 2-4 hours  
**Expected improvement:** 1000x faster (30s → 0.03s)

---

### 2. Update Security Vulnerabilities

**Vulnerabilities:**
- CVE-2025-25290 (@octokit/request)
- CVE-2024-21538 (cross-spawn)

**Commands:**
```bash
yarn upgrade @octokit/request@^8.4.1
yarn upgrade @changesets/cli@latest

# Verify
yarn audit --level high
yarn test
```

**Effort:** 1-2 hours  
**Risk:** Low (dev dependency)

---

### 3. Implement Node Update Batching

**File:** `src/plugin/NodeManager.ts:43-101`

**Impact:** 50-70% reduction in update time

**Implementation:**
```typescript
public async findBaseNodesWithData(opts: {
  updateMode?: UpdateMode;
  nodes?: readonly BaseNode[];
  nodesWithoutPluginData?: boolean;
}) {
  const BATCH_SIZE = 100; // Process 100 nodes at a time
  const tracker = new ProgressTracker(BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA);
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
    for (let i = 0; i < relevantNodes.length; i += BATCH_SIZE) {
      const batch = relevantNodes.slice(i, i + BATCH_SIZE);
      
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
  })();
  
  await this.waitForUpdating();
  
  postToUI({
    type: MessageFromPluginTypes.COMPLETE_JOB,
    name: BackgroundJobs.NODEMANAGER_FINDNODESWITHDATA,
  });
  
  return returnedNodes;
}
```

**Testing:**
```typescript
it('should batch process 10000 nodes efficiently', async () => {
  const nodes = generateTestNodes(10000);
  const start = performance.now();
  
  const result = await nodeManager.findBaseNodesWithData({
    updateMode: UpdateMode.DOCUMENT,
    nodes,
  });
  
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(8000); // 8 seconds max
  expect(result).toHaveLength(10000);
});
```

**Effort:** 4-6 hours  
**Expected improvement:** 50-70% reduction (15s → 5-7s)

---

## 🟠 HIGH - Week 2-3

### 4. Add JSON Serialization Cache

**Problem:** 246 JSON.stringify/parse calls without caching

**Create:** `src/utils/SerializationCache.ts`
```typescript
import LRU from 'lru-cache';
import hash from 'object-hash';

class SerializationCache {
  private stringifyCache = new LRU<string, string>({
    max: 500,
    ttl: 1000 * 60 * 5, // 5 minutes
  });
  
  private parseCache = new LRU<string, any>({
    max: 500,
    ttl: 1000 * 60 * 5,
  });
  
  stringify(obj: any): string {
    const key = hash(obj);
    
    if (this.stringifyCache.has(key)) {
      return this.stringifyCache.get(key)!;
    }
    
    const result = JSON.stringify(obj);
    this.stringifyCache.set(key, result);
    return result;
  }
  
  parse<T = any>(str: string): T {
    if (this.parseCache.has(str)) {
      return this.parseCache.get(str) as T;
    }
    
    const result = JSON.parse(str);
    this.parseCache.set(str, result);
    return result;
  }
  
  clear() {
    this.stringifyCache.clear();
    this.parseCache.clear();
  }
}

export const serializationCache = new SerializationCache();
```

**Usage:**
```typescript
// Replace JSON.stringify/parse throughout codebase
import { serializationCache } from '@/utils/SerializationCache';

// Before
const str = JSON.stringify(tokens);
const obj = JSON.parse(str);

// After
const str = serializationCache.stringify(tokens);
const obj = serializationCache.parse(str);
```

**Effort:** 8-12 hours (replace in multiple files)  
**Expected improvement:** 70-90% reduction in serialization time

---

### 5. Optimize TokenResolver with LRU Cache

**File:** `src/utils/TokenResolver.ts`

**Add LRU cache:**
```typescript
import LRU from 'lru-cache';

class TokenResolver {
  private resolveCache = new LRU<string, ResolveTokenValuesResult>({
    max: 5000,
    ttl: 1000 * 60 * 10, // 10 minutes
    updateAgeOnGet: true,
  });
  
  private resolveReferences(
    token: SingleToken, 
    resolvedReferences: Set<string> = new Set()
  ): ResolveTokenValuesResult {
    const cacheKey = `${token.name}:${JSON.stringify(token.value)}`;
    
    if (this.resolveCache.has(cacheKey)) {
      return this.resolveCache.get(cacheKey)!;
    }
    
    // Existing resolution logic...
    const result = this.performResolution(token, resolvedReferences);
    
    this.resolveCache.set(cacheKey, result);
    return result;
  }
  
  public setTokens(tokens: SingleToken[]): ResolveTokenValuesResult[] {
    this.tokens = tokens;
    this.tokenMap = new Map();
    this.memo = new Map();
    this.resolveCache.clear(); // Clear cache on token update
    this.populateTokenMap();
    
    return this.resolveTokenValues();
  }
}
```

**Effort:** 4-6 hours  
**Expected improvement:** 60-80% for repeated resolutions

---

### 6. Add React Virtualization for Large Lists

**Install dependency:**
```bash
yarn add react-window
```

**Example implementation for theme list:**
```typescript
import { FixedSizeList } from 'react-window';
import { memo } from 'react';

const ThemeListItem = memo(({ theme, style }: { theme: Theme; style: any }) => (
  <div style={style}>
    <ThemeCard theme={theme} />
  </div>
), (prev, next) => prev.theme.id === next.theme.id);

export const ThemeList = ({ themes }: { themes: Theme[] }) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={themes.length}
      itemSize={60}
      width="100%"
      overscanCount={5}
    >
      {({ index, style }) => (
        <ThemeListItem theme={themes[index]} style={style} />
      )}
    </FixedSizeList>
  );
};
```

**Files to update:**
- `src/app/components/ThemeSelector/ThemeSelector.tsx`
- `src/app/components/TokenSetSelector.tsx`
- Any component rendering > 100 items

**Effort:** 12-16 hours  
**Expected improvement:** 80-95% reduction in render time

---

## 🟡 MEDIUM - Week 4-6

### 7. Reduce TypeScript 'any' Usage

**Goal:** Reduce from 152 to < 50

**Strategy:**
1. Enable `noImplicitAny: true` in tsconfig.json
2. Fix errors gradually by file
3. Replace `any` with `unknown` where appropriate

**Example fix:**
```typescript
// Before
function processValue(value: any) {
  return value.toString();
}

// After
function processValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  throw new Error('Invalid value type');
}
```

**Effort:** 16-24 hours  
**Priority:** Medium (improves type safety)

---

### 8. Refactor Large Files

**Target files > 800 lines:**
- `tokenState.test.ts` (2,115 lines)
- `tokenState.tsx` (1,119 lines)
- `GithubTokenStorage.test.ts` (1,528 lines)

**Strategy:** Split by domain

**Example for tokenState.tsx:**
```
src/app/store/models/tokenState/
├── index.ts              # Public API
├── types.ts              # Type definitions
├── state.ts              # Initial state
├── reducers/
│   ├── tokens.ts         # Token operations
│   ├── themes.ts         # Theme operations
│   └── import.ts         # Import/export
├── effects/
│   ├── validation.ts
│   └── sync.ts
└── __tests__/
    ├── tokens.test.ts
    └── themes.test.ts
```

**Effort:** 20-30 hours  
**Priority:** Medium (improves maintainability)

---

### 9. Address Technical Debt (TODOs)

**Current count:** 78 TODOs/FIXMEs

**Process:**
1. Create GitHub issues for each TODO
2. Link issues in comments
3. Prioritize and schedule

**Script to automate:**
```typescript
// scripts/create-todo-issues.ts
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

async function createIssuesFromTodos() {
  const files = glob.sync('src/**/*.{ts,tsx}');
  const todos: Array<{file: string; line: number; text: string}> = [];
  
  files.forEach(file => {
    const content = readFileSync(file, 'utf-8');
    content.split('\n').forEach((line, index) => {
      const match = line.match(/\/\/\s*(TODO|FIXME):\s*(.+)/);
      if (match) {
        todos.push({
          file,
          line: index + 1,
          text: match[2].trim(),
        });
      }
    });
  });
  
  for (const todo of todos) {
    await octokit.issues.create({
      owner: 'tokens-studio',
      repo: 'figma-plugin',
      title: `TODO: ${todo.text}`,
      body: `Found in \`${todo.file}:${todo.line}\`\n\n${todo.text}`,
      labels: ['technical-debt', 'todo'],
    });
  }
}
```

**Effort:** 10-15 hours (organizing and planning)  
**Priority:** Medium (reduces tech debt)

---

## 📊 Performance Monitoring Setup

### Add Performance Measurement

**Create:** `src/utils/performance.ts`
```typescript
interface PerformanceMark {
  name: string;
  start: number;
  end?: number;
  duration?: number;
}

class PerformanceMonitor {
  private marks = new Map<string, PerformanceMark>();
  
  start(name: string) {
    this.marks.set(name, {
      name,
      start: performance.now(),
    });
  }
  
  end(name: string) {
    const mark = this.marks.get(name);
    if (!mark) return;
    
    mark.end = performance.now();
    mark.duration = mark.end - mark.start;
    
    // Log to console in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${name}: ${mark.duration.toFixed(2)}ms`);
    }
    
    // Send to analytics
    if (window.analytics) {
      window.analytics.track('Performance', {
        operation: name,
        duration: mark.duration,
      });
    }
    
    return mark.duration;
  }
  
  getReport() {
    const report: Record<string, number> = {};
    this.marks.forEach((mark, name) => {
      if (mark.duration) {
        report[name] = mark.duration;
      }
    });
    return report;
  }
}

export const perfMon = new PerformanceMonitor();
```

**Usage:**
```typescript
import { perfMon } from '@/utils/performance';

export async function updateNodes(nodes) {
  perfMon.start('updateNodes');
  
  // ... existing code ...
  
  perfMon.end('updateNodes');
}
```

---

## Success Metrics

### Performance Targets

| Operation | Baseline | Target | Priority |
|-----------|----------|--------|----------|
| Duplicate detection (4k tokens) | 15-30s | <0.1s | 🔴 CRITICAL |
| Node updates (10k nodes) | 8-15s | 3-5s | 🔴 CRITICAL |
| Token resolution (4k tokens) | 2-5s | <1s | 🟠 HIGH |
| React list render (4k items) | 2-5s | <0.5s | 🟠 HIGH |
| JSON operations | 3-8s | <0.5s | 🟠 HIGH |

### Code Quality Targets

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| Test pass rate | 99.7% | 100% | 🟠 HIGH |
| Linter warnings | ~50 | 0 | 🟡 MEDIUM |
| 'any' types | 152 | <50 | 🟡 MEDIUM |
| TODO count | 78 | <20 | 🟡 MEDIUM |
| Security vulns | 2 high | 0 | 🔴 CRITICAL |

---

## Testing Strategy

### Performance Regression Tests

**Create:** `tests/performance/critical-paths.perf.ts`
```typescript
describe('Performance Regression Tests', () => {
  const TOKENS_4K = generateTokens(4000);
  const NODES_10K = generateNodes(10000);
  
  it('validates 4000 tokens in < 100ms', () => {
    const duration = measureTime(() => {
      validateGroupName(TOKENS_4K, 'new', 'old');
    });
    expect(duration).toBeLessThan(100);
  });
  
  it('processes 10000 nodes in < 5000ms', async () => {
    const duration = await measureTimeAsync(() => {
      return nodeManager.findBaseNodesWithData({
        nodes: NODES_10K,
      });
    });
    expect(duration).toBeLessThan(5000);
  });
  
  it('resolves 4000 tokens in < 1000ms', () => {
    const resolver = new TokenResolver(TOKENS_4K);
    const duration = measureTime(() => {
      resolver.resolveTokenValues();
    });
    expect(duration).toBeLessThan(1000);
  });
});
```

**Add to CI:**
```yaml
# .github/workflows/performance.yml
name: Performance Tests
on: [push, pull_request]
jobs:
  perf:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test:perf
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const results = fs.readFileSync('perf-results.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: `Performance test results:\n\`\`\`json\n${results}\n\`\`\``
            });
```

---

## Documentation Updates

### Update CLAUDE.md

Add section on performance:
```markdown
## Performance Considerations

When working with large datasets (4000+ tokens, 10000+ nodes):

1. **Use batching** for operations on multiple nodes
2. **Leverage caching** for expensive computations
3. **Memoize React components** rendering large lists
4. **Use virtualization** for lists > 100 items
5. **Profile before optimizing** with perfMon utility

See `claude_docs/performance-analysis.md` for details.
```

---

## Rollout Plan

### Week 1: Critical Fixes
- ✅ Fix O(n²) duplicate detection
- ✅ Update security vulnerabilities
- ✅ Add node update batching

### Week 2-3: Performance Optimization
- ✅ Add JSON serialization cache
- ✅ Optimize TokenResolver
- ✅ Implement React virtualization

### Week 4-6: Code Quality
- ✅ Reduce 'any' types
- ✅ Refactor large files
- ✅ Address technical debt

### Month 2-3: Monitoring & Documentation
- ✅ Set up performance monitoring
- ✅ Add regression tests
- ✅ Update documentation

---

## Risk Mitigation

### Potential Issues

1. **Breaking changes in updates**
   - Mitigation: Comprehensive testing
   - Feature flags for gradual rollout

2. **Performance improvements break functionality**
   - Mitigation: Keep old code paths with feature flag
   - A/B test with subset of users

3. **Cache invalidation bugs**
   - Mitigation: Conservative TTLs
   - Easy cache clear mechanism
   - Extensive testing

---

*Implementation roadmap created October 2025*
