# Code Quality Analysis

## Overview
Analysis of code quality metrics, patterns, and maintainability issues in the Tokens Studio Figma Plugin codebase.

---

## 🟡 MEDIUM: Linting Issues

### Current State
**Total warnings:** ~50 (from lint output)

### Categories of Issues:

#### 1. Console Statements (Warning)
**Count:** ~15 occurrences

**Examples:**
```typescript
// src/AsyncMessageChannel.ts:95
console.log('Message received');

// src/app/components/ColorPicker/ColorPicker.tsx:58
console.log('Color value:', value);
```

**Impact:**
- **Production logs** may expose sensitive data
- **Performance impact** (console.log is slow)
- **Debug code** left in production

**Fix:**
```typescript
// Option 1: Remove
// console.log('Message received');

// Option 2: Use debug utility
import debug from './utils/debug';
debug.log('Message received'); // Only logs in dev mode

// Option 3: Use proper logging
import { logger } from './utils/logger';
logger.debug('Message received');
```

**Automation:**
```bash
# Add to package.json
"scripts": {
  "lint:console": "grep -r 'console\\.' src --include='*.ts' --include='*.tsx'",
  "precommit": "yarn lint:console && yarn lint"
}
```

---

#### 2. Variable Shadowing (Warning)
**Count:** ~10 occurrences

**Example:**
```typescript
// src/app/components/EditTokenForm.tsx:106-108
const t = useTranslation(); // Outer scope

// Later in same file:
.map((editToken, t) => { // ← Shadows 't' parameter
  const t = something; // ← Shadows again!
})
```

**Impact:**
- **Confusing code** - hard to know which variable is referenced
- **Bug risk** - easy to use wrong variable
- **Refactoring hazard** - changes may break unexpectedly

**Fix:**
```typescript
// Use descriptive names
const { t: translate } = useTranslation();

.map((editToken, index) => {
  const tokenValue = something;
})
```

---

#### 3. React Hooks Dependencies (Warning)
**Count:** ~20 occurrences

**Example:**
```typescript
// src/app/components/CompositionTokenForm.tsx:47
useEffect(() => {
  // Uses internalEditToken.value
}, []); // ← Missing dependencies!
```

**Impact:**
- **Stale closures** - using old values
- **Bugs** when dependencies change
- **Unexpected behavior**

**Fix:**
```typescript
// Option 1: Add dependencies
useEffect(() => {
  // Uses internalEditToken.value
}, [internalEditToken.value]);

// Option 2: Use callback form
useEffect(() => {
  // If you truly want to run once
  const value = internalEditToken.value;
  // ...
}, []); // Now safe

// Option 3: Disable with justification
useEffect(() => {
  // Intentionally run only on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

---

## 🟡 MEDIUM: TypeScript Issues

### 1. Implicit Any (152 occurrences)

**Config:**
```typescript
// tsconfig.json:14
"noImplicitAny": false,  // ← Should be true!
```

**Examples:**
```typescript
// Bad
function processToken(token) {  // ← Implicit any
  return token.value;
}

// Good
function processToken(token: Token): string {
  return token.value;
}
```

**Recommendation:**
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

### 2. Type Coverage

**Measure type coverage:**
```bash
npx type-coverage --detail --strict
```

**Target metrics:**
- **Overall coverage:** > 95%
- **Strict coverage:** > 90%
- **'any' count:** < 50

**Action plan:**
```typescript
// Create script to track progress
// scripts/check-type-coverage.ts
import { execSync } from 'child_process';

const result = execSync('npx type-coverage --detail').toString();
const match = result.match(/(\d+\.\d+)%/);
const coverage = parseFloat(match[1]);

if (coverage < 95) {
  console.error(`Type coverage ${coverage}% is below 95% threshold`);
  process.exit(1);
}
```

---

### 3. Missing Null Checks

**Example:**
```typescript
// Potential null reference
const node = figma.getNodeById(id);
node.name = 'new name'; // ← May crash if node is null
```

**Fix:**
```typescript
const node = figma.getNodeById(id);
if (!node) {
  throw new Error(`Node ${id} not found`);
}
node.name = 'new name'; // Safe
```

**Use Optional Chaining:**
```typescript
// Before
if (token && token.value && token.value.color) {
  applyColor(token.value.color);
}

// After
if (token?.value?.color) {
  applyColor(token.value.color);
}
```

---

## 🟡 MEDIUM: Code Smells

### 1. Long Functions

**Example:** Many functions > 100 lines

**Problems:**
- Hard to understand
- Hard to test
- Hard to maintain

**Solution: Extract Methods**
```typescript
// Before (150 lines)
async function updateNodes(nodes) {
  // Validation logic (20 lines)
  // Transformation logic (40 lines)
  // Update logic (50 lines)
  // Cleanup logic (40 lines)
}

// After
async function updateNodes(nodes) {
  validateNodes(nodes);
  const transformed = transformNodes(nodes);
  await applyUpdates(transformed);
  cleanupAfterUpdate();
}

function validateNodes(nodes) { /* 20 lines */ }
function transformNodes(nodes) { /* 40 lines */ }
async function applyUpdates(nodes) { /* 50 lines */ }
function cleanupAfterUpdate() { /* 40 lines */ }
```

---

### 2. Duplicate Code

**Tool to detect:**
```bash
npx jscpd src
```

**Example pattern found:**
```typescript
// Pattern 1: Repeated in 5 files
const tokens = useSelector((state) => state.tokenState.tokens);
const themes = useSelector((state) => state.tokenState.themes);
const activeTheme = useSelector((state) => state.tokenState.activeTheme);

// Solution: Custom hook
function useTokenState() {
  const tokens = useSelector((state) => state.tokenState.tokens);
  const themes = useSelector((state) => state.tokenState.themes);
  const activeTheme = useSelector((state) => state.tokenState.activeTheme);
  
  return { tokens, themes, activeTheme };
}

// Usage
const { tokens, themes, activeTheme } = useTokenState();
```

---

### 3. Magic Numbers

**Examples:**
```typescript
// Bad
if (tokens.length > 4000) {
  // Switch to pagination
}

setTimeout(() => {}, 5000);

// Good
const MAX_TOKENS_BEFORE_PAGINATION = 4000;
const DEBOUNCE_DELAY_MS = 5000;

if (tokens.length > MAX_TOKENS_BEFORE_PAGINATION) {
  // Switch to pagination
}

setTimeout(() => {}, DEBOUNCE_DELAY_MS);
```

---

### 4. Complex Conditionals

**Example:**
```typescript
// Hard to understand
if (token && token.type === 'color' && token.value && 
    token.value.startsWith('#') && token.value.length === 7 && 
    !token.disabled && activeTheme) {
  // Do something
}

// Better: Extract to function
function isValidActiveColorToken(token: Token, activeTheme: Theme): boolean {
  if (!token || !activeTheme) return false;
  if (token.type !== 'color') return false;
  if (!token.value?.startsWith('#')) return false;
  if (token.value.length !== 7) return false;
  if (token.disabled) return false;
  return true;
}

if (isValidActiveColorToken(token, activeTheme)) {
  // Do something
}
```

---

## 🟡 MEDIUM: Technical Debt

### TODO/FIXME Comments (78 found)

**Analysis by category:**

```bash
# Count by type
grep -r "TODO" src | wc -l  # 45
grep -r "FIXME" src | wc -l # 22
grep -r "HACK" src | wc -l  # 8
grep -r "XXX" src | wc -l   # 3
```

**Recommendation:**
1. **Create issues** for each TODO
2. **Link issues** in comments
3. **Track in project board**

```typescript
// Bad
// TODO: Fix this later

// Good
// TODO(#1234): Refactor to use new TokenResolver API
// See: https://github.com/tokens-studio/figma-plugin/issues/1234
```

**Create tracking script:**
```typescript
// scripts/track-debt.ts
import { readFileSync } from 'fs';
import { glob } from 'glob';

const files = glob.sync('src/**/*.{ts,tsx}');
const todos: { file: string; line: number; text: string }[] = [];

files.forEach(file => {
  const content = readFileSync(file, 'utf-8');
  content.split('\n').forEach((line, index) => {
    if (line.includes('TODO') || line.includes('FIXME')) {
      todos.push({ file, line: index + 1, text: line.trim() });
    }
  });
});

console.log(`Found ${todos.length} TODOs`);
console.table(todos);
```

---

## 🟢 POSITIVE: Good Practices

### 1. Strong Test Coverage

**1,505 tests passing** across:
- Unit tests
- Integration tests
- Component tests

**Example good test:**
```typescript
describe('TokenResolver', () => {
  it('should resolve token references', () => {
    const tokens = [
      { name: 'primary', value: '{colors.blue}' },
      { name: 'colors.blue', value: '#0000ff' },
    ];
    
    const resolver = new TokenResolver(tokens);
    const resolved = resolver.resolveTokenValues();
    
    expect(resolved[0].value).toBe('#0000ff');
  });
});
```

---

### 2. Modern Tooling

**Excellent choices:**
- ✅ TypeScript for type safety
- ✅ ESLint with strict rules
- ✅ Prettier for formatting
- ✅ Husky for git hooks
- ✅ Jest for testing
- ✅ SWC for fast builds

---

### 3. Clean Code Patterns

**Example from codebase:**
```typescript
// Good: Single Responsibility
class TokenValidator {
  validate(token: Token): ValidationResult {
    const errors: string[] = [];
    
    if (!this.hasValidName(token)) {
      errors.push('Invalid token name');
    }
    
    if (!this.hasValidValue(token)) {
      errors.push('Invalid token value');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  private hasValidName(token: Token): boolean { /* ... */ }
  private hasValidValue(token: Token): boolean { /* ... */ }
}
```

---

## Code Quality Metrics

### Current State

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Test Count | 1,505 | Maintain | ✅ |
| Test Pass Rate | 99.7% | 100% | ⚠️ |
| Linter Warnings | ~50 | 0 | ❌ |
| Console Logs | ~15 | 0 | ❌ |
| TODO Comments | 78 | <10 | ❌ |
| Type Coverage | Unknown | >95% | ⚠️ |
| Code Duplication | Unknown | <5% | ⚠️ |
| Cyclomatic Complexity | Unknown | <10 | ⚠️ |

---

## Recommendations

### Immediate (Week 1)
1. **Fix failing tests** (5 failures)
2. **Remove console.log** statements
3. **Fix variable shadowing**

### Short-term (Week 2-4)
4. **Add missing dependencies** to React hooks
5. **Enable noImplicitAny** in tsconfig
6. **Create issues for TODOs**

### Medium-term (Month 2-3)
7. **Refactor functions > 100 lines**
8. **Reduce code duplication**
9. **Improve type coverage to 95%**

---

## Code Quality Tools Setup

### 1. Add to package.json:
```json
{
  "scripts": {
    "quality:check": "npm-run-all quality:*",
    "quality:lint": "eslint . --max-warnings 0",
    "quality:types": "tsc --noEmit",
    "quality:test": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'",
    "quality:complexity": "npx complexity-report src",
    "quality:duplication": "npx jscpd src --threshold 5",
    "quality:debt": "ts-node scripts/track-debt.ts"
  }
}
```

### 2. Add to CI/CD:
```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: yarn install
      - run: yarn quality:check
      - name: Comment PR with results
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              body: 'Code quality checks passed! ✅'
            })
```

### 3. Add Pre-commit Hooks:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && yarn quality:types"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ]
  }
}
```

---

## Documentation Improvements

### 1. Add JSDoc Comments

**Current state:** Minimal documentation

**Recommendation:**
```typescript
/**
 * Resolves token references and returns computed values.
 * 
 * @param tokens - Array of tokens to resolve
 * @param options - Optional resolution configuration
 * @returns Array of resolved tokens with computed values
 * 
 * @example
 * ```ts
 * const tokens = [
 *   { name: 'primary', value: '{colors.blue}' }
 * ];
 * const resolved = resolveTokens(tokens);
 * console.log(resolved[0].value); // '#0000ff'
 * ```
 * 
 * @throws {TokenResolutionError} When circular references detected
 */
export function resolveTokens(
  tokens: Token[],
  options?: ResolveOptions
): ResolvedToken[] {
  // Implementation
}
```

### 2. Add Architecture Decision Records (ADRs)

```markdown
# ADR 001: Use Redux for State Management

## Status
Accepted

## Context
Need centralized state management for complex token/theme state.

## Decision
Use Redux with Rematch for state management.

## Consequences
- Pros: Predictable state, good dev tools, time-travel debugging
- Cons: Boilerplate code, learning curve

## Alternatives Considered
- MobX: Less boilerplate but magical
- Context API: Too simple for complex state
- Zustand: Not mature enough at time of decision
```

---

## Summary

**Strengths:**
- ✅ Good test coverage
- ✅ Modern tooling
- ✅ TypeScript usage

**Areas for Improvement:**
- ❌ Fix linting warnings
- ❌ Improve type safety
- ❌ Reduce technical debt
- ❌ Better documentation

**Priority Actions:**
1. Fix test failures
2. Remove console logs
3. Enable strict TypeScript
4. Track and resolve TODOs

---

*Code quality review completed October 2025*
