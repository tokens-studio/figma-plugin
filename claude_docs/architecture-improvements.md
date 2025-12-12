# Architecture Improvements and Recommendations

## Current Architecture Overview

### Strengths
1. **Clean separation** between UI (React) and Plugin (Figma API)
2. **Message-passing architecture** via AsyncMessageChannel
3. **State management** with Redux/Rematch
4. **Worker-based** concurrent processing
5. **Modular storage providers** for different backends

### Architecture Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                         UI Layer (React)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ Components  │──│ Redux Store  │──│ AsyncMessage    │   │
│  │             │  │ (Rematch)    │  │ Channel         │   │
│  └─────────────┘  └──────────────┘  └────────┬────────┘   │
└────────────────────────────────────────────────┼───────────┘
                                                  │
                 ┌────────────────────────────────┼───────────┐
                 │        Message Passing         │           │
                 └────────────────────────────────┼───────────┘
                                                  │
┌────────────────────────────────────────────────┼───────────┐
│                    Plugin Layer (Figma API)    │           │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────▼─────────┐ │
│  │ Node        │  │ Token        │  │ Message           │ │
│  │ Manager     │──│ Resolver     │  │ Handlers          │ │
│  └─────────────┘  └──────────────┘  └───────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐                        │
│  │ Shared Data │  │ Worker       │                        │
│  │ Handler     │  │ Pool         │                        │
│  └─────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔴 CRITICAL: Architecture Issues

### 1. No Data Layer Abstraction

**Problem:**
Token data flows directly from state to components without a dedicated data access layer.

**Issues:**
- **No caching strategy**
- **Duplicate queries** across components
- **No request deduplication**
- **Tightly coupled** to state shape

**Current Pattern:**
```typescript
// Component directly accesses state
const tokens = useSelector((state) => state.tokenState.tokens);
const themes = useSelector((state) => state.tokenState.themes);

// Multiple components may access same data
// No shared cache, each selector runs independently
```

**Recommended Pattern:**
```typescript
// Create data access layer
class TokenDataService {
  private cache = new LRU({ max: 1000 });
  
  async getTokens(setName: string): Promise<Token[]> {
    const cacheKey = `tokens:${setName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const tokens = await this.fetchTokens(setName);
    this.cache.set(cacheKey, tokens);
    return tokens;
  }
  
  async getResolvedTokens(setName: string): Promise<ResolvedToken[]> {
    const cacheKey = `resolved:${setName}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const tokens = await this.getTokens(setName);
    const resolved = await this.resolver.resolve(tokens);
    this.cache.set(cacheKey, resolved);
    return resolved;
  }
  
  invalidate(setName: string) {
    this.cache.delete(`tokens:${setName}`);
    this.cache.delete(`resolved:${setName}`);
  }
}

// Usage in components
const tokens = useTokens(setName); // Custom hook wraps service
```

**Benefits:**
- Single source of truth for data access
- Built-in caching
- Easy to add optimizations
- Testable in isolation

---

### 2. Synchronous Plugin Operations

**Problem:**
Many Figma API operations run synchronously, blocking the main thread.

**Location:** `src/plugin/updateNodes.ts`

**Current Pattern:**
```typescript
export async function updateNodes(nodes: NodeManagerNode[]) {
  for (const { node, tokens } of nodes) {
    await setValuesOnNode(node, tokens); // Synchronous operations inside
  }
}
```

**Issues:**
- Blocks UI for 10,000 nodes
- No progress indication during blocking operations
- Can't cancel mid-operation

**Recommended Pattern:**
```typescript
// Use requestIdleCallback pattern
export async function updateNodes(
  nodes: NodeManagerNode[], 
  onProgress?: (progress: number) => void
) {
  const BATCH_SIZE = 50;
  let processed = 0;
  
  for (let i = 0; i < nodes.length; i += BATCH_SIZE) {
    await new Promise(resolve => requestIdleCallback(resolve));
    
    const batch = nodes.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(({ node, tokens }) => setValuesOnNode(node, tokens))
    );
    
    processed += batch.length;
    onProgress?.(processed / nodes.length);
  }
}
```

---

### 3. No Event-Driven Architecture for Updates

**Problem:**
State changes trigger full re-computation instead of incremental updates.

**Example:**
```typescript
// When one token changes, entire token set is re-resolved
setTokens(newTokens); // Triggers full resolution
```

**Recommended: Event-Driven Updates**
```typescript
class TokenEventBus {
  private listeners = new Map<string, Set<(event: TokenEvent) => void>>();
  
  emit(event: TokenEvent) {
    const listeners = this.listeners.get(event.type) || new Set();
    listeners.forEach(fn => fn(event));
  }
  
  on(eventType: string, handler: (event: TokenEvent) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);
  }
}

// Usage
eventBus.on('token:updated', (event) => {
  // Only re-resolve affected tokens
  const affected = findAffectedTokens(event.tokenName);
  resolveTokens(affected);
});
```

---

## 🟠 HIGH: Scalability Concerns

### 1. In-Memory State Growth

**Problem:**
Entire token/theme state kept in memory with no pruning.

**Risk with 4000 tokens:**
- State object: ~5-10 MB
- Resolved tokens: ~10-20 MB
- Compressed strings: ~2-5 MB
- **Total: ~20-40 MB per user**

**Recommendation:**
```typescript
// Implement state pruning
class StateManager {
  private readonly MAX_STATE_SIZE = 50 * 1024 * 1024; // 50 MB
  private stateHistory: State[] = [];
  
  setState(newState: State) {
    this.stateHistory.push(newState);
    
    // Prune if too large
    const totalSize = this.calculateSize();
    if (totalSize > this.MAX_STATE_SIZE) {
      this.pruneOldStates();
    }
  }
  
  private pruneOldStates() {
    // Keep only last 10 states
    this.stateHistory = this.stateHistory.slice(-10);
  }
}
```

---

### 2. No Database/IndexedDB for Large Datasets

**Problem:**
Everything stored in:
1. Figma plugin storage (limited)
2. In-memory state
3. Compressed strings

**For 4000 tokens, consider:**
```typescript
// Use IndexedDB for local caching
class IndexedDBCache {
  private db: IDBDatabase;
  
  async getTokens(setName: string): Promise<Token[]> {
    const tx = this.db.transaction(['tokens'], 'readonly');
    const store = tx.objectStore('tokens');
    return store.get(setName);
  }
  
  async setTokens(setName: string, tokens: Token[]) {
    const tx = this.db.transaction(['tokens'], 'readwrite');
    const store = tx.objectStore('tokens');
    await store.put({ id: setName, tokens, updatedAt: Date.now() });
  }
}
```

**Benefits:**
- Persistent local cache
- Handles large datasets
- Fast read/write
- Doesn't block main thread

---

### 3. Monolithic State Object

**Problem:**
Single massive state object in Redux:

```typescript
interface TokenState {
  tokens: Record<string, AnyTokenList>;        // Large
  themes: ThemeObjectsList;                    // Medium
  importedTokens: { ... };                     // Large
  compressedTokens: string;                    // Large
  compressedThemes: string;                    // Medium
  // ... many more fields
}
```

**Issues:**
- **Any change** causes entire state to serialize
- **Selector invalidation** on unrelated changes
- **Large memory footprint**

**Recommendation: Split into Domains**
```typescript
// Separate state domains
interface RootState {
  tokens: TokensState;      // Token data only
  themes: ThemesState;      // Theme data only
  ui: UIState;              // UI state only
  sync: SyncState;          // Sync status only
}

// Each domain can be optimized independently
const tokensReducer = createSlice({
  name: 'tokens',
  initialState: { byId: {}, allIds: [] },
  // Normalized state shape
});
```

---

## 🟡 MEDIUM: Code Organization

### 1. Large Files Need Splitting

**Files over 800 lines:**
1. `tokenState.test.ts` - 2,115 lines
2. `tokenState.tsx` - 1,119 lines
3. `GithubTokenStorage.test.ts` - 1,528 lines

**Recommendation:**
```
src/app/store/models/tokenState/
├── index.ts                    # Public API
├── types.ts                    # Types
├── state.ts                    # Initial state
├── reducers/
│   ├── tokens.ts
│   ├── themes.ts
│   └── sync.ts
├── effects/
│   ├── import.ts
│   ├── export.ts
│   └── validation.ts
└── __tests__/
    ├── tokens.test.ts
    ├── themes.test.ts
    └── validation.test.ts
```

---

### 2. Circular Dependency Risk

**Current:**
```javascript
// .eslintrc.js
rules: {
  'import/no-cycle': 0,  // ← Disabled!
}
```

**Why this is risky:**
- Hard to understand dependencies
- Can cause initialization issues
- Makes code splitting difficult

**Recommendation:**
1. Enable `'import/no-cycle': 2`
2. Use dependency injection to break cycles
3. Create clear architectural layers:
   ```
   Presentation Layer (Components)
          ↓
   Application Layer (Hooks, State)
          ↓
   Domain Layer (Business Logic)
          ↓
   Infrastructure Layer (API, Storage)
   ```

---

### 3. Missing Domain Layer

**Current architecture:**
```
Components → Redux → Figma API
```

**Recommended architecture:**
```
Components → Hooks → Services → Domain Models → Repository → Storage
```

**Example Domain Model:**
```typescript
// domain/Token.ts
export class Token {
  constructor(
    public readonly name: string,
    public readonly value: string,
    public readonly type: TokenType
  ) {}
  
  resolve(resolver: TokenResolver): ResolvedToken {
    return resolver.resolve(this);
  }
  
  validate(): ValidationResult {
    // Business logic here
    return TokenValidator.validate(this);
  }
  
  toJSON() {
    return { name: this.name, value: this.value, type: this.type };
  }
  
  static fromJSON(json: any): Token {
    return new Token(json.name, json.value, json.type);
  }
}
```

**Benefits:**
- Business logic centralized
- Easy to test
- Type-safe
- Reusable across layers

---

## 🟢 Recommended Patterns

### 1. Repository Pattern for Storage

```typescript
interface ITokenRepository {
  getAll(): Promise<Token[]>;
  getById(id: string): Promise<Token | null>;
  save(token: Token): Promise<void>;
  delete(id: string): Promise<void>;
}

class FigmaTokenRepository implements ITokenRepository {
  constructor(private storage: FigmaStorage) {}
  
  async getAll(): Promise<Token[]> {
    const data = await this.storage.get('tokens');
    return data.map(Token.fromJSON);
  }
  
  // ... other methods
}

// Easy to swap implementations
class IndexedDBTokenRepository implements ITokenRepository {
  // Same interface, different storage
}
```

---

### 2. Command Pattern for Operations

```typescript
interface Command {
  execute(): Promise<void>;
  undo(): Promise<void>;
}

class UpdateTokenCommand implements Command {
  constructor(
    private tokenId: string,
    private newValue: string,
    private oldValue: string
  ) {}
  
  async execute() {
    await tokenRepository.update(this.tokenId, this.newValue);
  }
  
  async undo() {
    await tokenRepository.update(this.tokenId, this.oldValue);
  }
}

// Enables undo/redo
class CommandHistory {
  private history: Command[] = [];
  private position = -1;
  
  async execute(command: Command) {
    await command.execute();
    this.history = this.history.slice(0, this.position + 1);
    this.history.push(command);
    this.position++;
  }
  
  async undo() {
    if (this.position >= 0) {
      await this.history[this.position].undo();
      this.position--;
    }
  }
  
  async redo() {
    if (this.position < this.history.length - 1) {
      this.position++;
      await this.history[this.position].execute();
    }
  }
}
```

---

### 3. Observer Pattern for State Changes

```typescript
interface Observer<T> {
  update(data: T): void;
}

class TokenStateSubject {
  private observers: Set<Observer<TokenState>> = new Set();
  
  attach(observer: Observer<TokenState>) {
    this.observers.add(observer);
  }
  
  detach(observer: Observer<TokenState>) {
    this.observers.delete(observer);
  }
  
  notify(state: TokenState) {
    this.observers.forEach(observer => observer.update(state));
  }
}

// Usage
class TokenCacheInvalidator implements Observer<TokenState> {
  update(state: TokenState) {
    // Invalidate cache when tokens change
    if (state.hasUnsavedChanges) {
      this.invalidateCache();
    }
  }
}
```

---

## Architecture Migration Strategy

### Phase 1: Add Abstraction Layers (Week 1-2)
1. Create TokenDataService
2. Implement basic caching
3. No breaking changes to existing code

### Phase 2: Optimize Critical Paths (Week 3-4)
1. Add batching to NodeManager
2. Implement incremental updates
3. Add IndexedDB caching

### Phase 3: Refactor State (Week 5-8)
1. Split monolithic state
2. Normalize state shape
3. Implement domain models

### Phase 4: Enable Advanced Features (Week 9-12)
1. Add undo/redo
2. Implement real-time collaboration prep
3. Add state persistence

---

## Testing Recommendations

### Architecture Tests
```typescript
describe('Architecture Rules', () => {
  it('should not have circular dependencies', () => {
    const result = checkCircularDependencies();
    expect(result.circularDeps).toHaveLength(0);
  });
  
  it('should follow layered architecture', () => {
    const violations = checkLayerViolations({
      presentation: ['src/app/components'],
      application: ['src/app/store', 'src/app/hooks'],
      domain: ['src/domain'],
      infrastructure: ['src/storage', 'src/plugin'],
    });
    expect(violations).toHaveLength(0);
  });
});
```

---

## Summary

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| No data layer | High | Medium | 🔴 CRITICAL |
| Synchronous operations | High | Low | 🔴 CRITICAL |
| No event-driven updates | Medium | High | 🟠 HIGH |
| In-memory state growth | Medium | Medium | 🟠 HIGH |
| No IndexedDB | Low | Medium | 🟡 MEDIUM |
| Large files | Low | Low | 🟡 MEDIUM |
| Circular deps | Medium | Medium | 🟡 MEDIUM |

---

*This architecture review focuses on scalability and maintainability for enterprise-scale design systems.*
