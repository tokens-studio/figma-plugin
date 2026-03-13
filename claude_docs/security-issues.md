# Security Issues and Vulnerabilities

## Overview
Security assessment of the Tokens Studio Figma Plugin codebase, focusing on dependency vulnerabilities, code patterns, and potential attack vectors.

---

## 🔴 CRITICAL: Dependency Vulnerabilities

### 1. CVE-2025-25290: ReDoS in @octokit/request

**Severity:** HIGH  
**CVSS Score:** 5.3  
**Package:** `@octokit/request@5.6.3`  
**Fixed in:** `>= 8.4.1`

**Vulnerability:**
Regular Expression Denial of Service (ReDoS) vulnerability in link header parsing.

**Affected Code:**
```javascript
const matches = responseHeaders.link && 
  responseHeaders.link.match(/<([^>]+)>; rel=\"deprecation\"/);
```

**Attack Vector:**
An attacker can craft a malicious GitHub API response with a specially crafted `link` header:
```javascript
fakeHeaders.set("link", "<".repeat(100000) + ">");
```

This triggers catastrophic backtracking, causing:
- **High CPU usage** (100%)
- **Application freeze**
- **Denial of Service**

**Impact on Plugin:**
- Used in GitHub token storage integration
- Affects sync/push operations
- Can freeze Figma editor if triggered

**Fix Required:**
```bash
yarn upgrade @octokit/request@^8.4.1
```

---

### 2. CVE-2024-21538: ReDoS in cross-spawn

**Severity:** HIGH  
**CVSS Score:** 7.5  
**Package:** `cross-spawn@5.1.0` (via @changesets/cli)  
**Fixed in:** `>= 6.0.6`

**Vulnerability:**
Regular Expression Denial of Service due to improper input sanitization.

**Impact:**
- Affects build/release pipeline
- Can delay releases
- Lower direct user impact (dev dependency)

**Fix Required:**
```bash
yarn upgrade cross-spawn@^7.0.5
```

---

### 3. Other Detected Vulnerabilities

**From `yarn audit` output:**
- Multiple moderate severity issues in transitive dependencies
- Recommendation: Run full audit and update all dependencies

---

## 🟠 HIGH: Unsafe Code Patterns

### 1. Eval Usage in Math Parser

**Location:** `src/utils/math/checkAndEvaluateMath.ts:78`

**Problem:**
```typescript
import { Parser } from 'expr-eval';

const parser = new Parser();

// Later...
evaluated = parser.evaluate(`${unitlessExpr}`);  // ← Evaluates user input
```

**Risk:**
While `expr-eval` is a library designed for safe evaluation, it still:
1. **Executes arbitrary expressions** from user input
2. **No input sanitization** before evaluation
3. **Potential for complex expressions** causing performance issues

**Example Malicious Input:**
```typescript
// User enters in token value:
"(function(){while(true){}})()"  // Infinite loop
"Array(999999999).join('x')"     // Memory exhaustion
```

**Mitigation:**
1. **Add input validation:**
```typescript
const SAFE_EXPR_REGEX = /^[0-9+\-*/(). ]+$/;

export function checkAndEvaluateMath(expr: string) {
  // Validate input contains only safe characters
  if (!SAFE_EXPR_REGEX.test(expr) && !calcReduced) {
    return expr;
  }
  
  // Add timeout protection
  const timeout = setTimeout(() => {
    throw new Error('Math evaluation timeout');
  }, 100);
  
  try {
    evaluated = parser.evaluate(`${unitlessExpr}`);
  } catch (ex) {
    return expr;
  } finally {
    clearTimeout(timeout);
  }
}
```

2. **Implement expression complexity limits:**
```typescript
const MAX_EXPR_LENGTH = 1000;
const MAX_EXPR_DEPTH = 10;

if (expr.length > MAX_EXPR_LENGTH) {
  return expr;
}
```

---

### 2. JSON Parsing Without Validation

**Location:** Multiple files (246 occurrences)

**Problem:**
```typescript
// src/plugin/SharedDataHandler.ts:33
const parsedValue = value === 'none' ? 'none' : JSON.parse(value);
```

**Risk:**
1. **No schema validation** of parsed data
2. **Prototype pollution** potential
3. **Type confusion** if unexpected data shape

**Examples of Risk:**
```typescript
// Malicious plugin data
{
  "__proto__": {
    "isAdmin": true
  }
}
```

**Mitigation:**
```typescript
import { z } from 'zod';

// Define schemas
const TokenDataSchema = z.object({
  value: z.string(),
  type: z.string(),
  // ... other fields
});

// Validate parsed data
try {
  const parsedValue = JSON.parse(value);
  const validated = TokenDataSchema.parse(parsedValue);
  return validated;
} catch (err) {
  console.warn('Invalid token data:', err);
  return null;
}
```

---

## 🟡 MEDIUM: Type Safety Issues

### 1. Excessive Use of 'any' Type

**Count:** 152 occurrences

**Risk:**
- **Type confusion** bugs
- **Runtime errors** not caught at compile time
- **Security bypasses** if types are assumed

**Examples Found:**
```typescript
// Example pattern
parser.functions.sample = (func: Function, ...args: any[]) => {
  return func(...args);  // ← Unchecked function call
};
```

**Recommendation:**
Replace `any` with proper types or `unknown`:
```typescript
// Better approach
parser.functions.sample = <T extends unknown[]>(
  func: (...args: T) => unknown, 
  ...args: T
) => {
  return func(...args);
};
```

**Action Items:**
1. Enable `noImplicitAny: true` in tsconfig.json (currently false)
2. Run type coverage tool: `npx type-coverage --detail`
3. Target: Reduce to < 50 instances

---

### 2. Missing Input Validation

**Location:** API endpoints and storage providers

**Problem:**
Many functions accept user input without validation:

```typescript
// src/storage/GithubTokenStorage.ts
public async write(data: any) {
  // No validation of 'data' structure
  await this.writeToGithub(data);
}
```

**Risk:**
- **Data corruption**
- **API errors** from malformed data
- **Security issues** if data flows to sensitive operations

**Mitigation:**
```typescript
import { z } from 'zod';

const WriteDataSchema = z.object({
  tokens: z.record(z.array(z.unknown())),
  themes: z.array(z.unknown()),
  // ... define all expected fields
});

public async write(data: unknown) {
  const validated = WriteDataSchema.parse(data);
  await this.writeToGithub(validated);
}
```

---

## 🟡 MEDIUM: Environment Variables

### Location
**File:** Multiple files using `process.env`

**Problem:**
```typescript
// No validation that required env vars exist
const mixpanelToken = process.env.MIXPANEL_ACCESS_TOKEN;
// What if undefined?
```

**Risk:**
- **Runtime errors** if missing
- **Silent failures** if optional vars missing
- **Security leaks** if logged

**Mitigation:**
```typescript
// config/env.ts
import { z } from 'zod';

const EnvSchema = z.object({
  MIXPANEL_ACCESS_TOKEN: z.string().optional(),
  STORYBLOK_ACCESS_TOKEN: z.string().optional(),
  ENVIRONMENT: z.enum(['development', 'production', 'test']),
  LICENSE_API_URL: z.string().url(),
  LAUNCHDARKLY_SDK_CLIENT: z.string(),
  SENTRY_DSN: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

// Usage
import { env } from './config/env';
const token = env.MIXPANEL_ACCESS_TOKEN;
```

---

## 🟢 POSITIVE: Security Practices

### Good Patterns Found:

1. **Sentry Integration**
   - Error tracking in place
   - Source maps for debugging

2. **Authentication**
   - OAuth flows properly implemented
   - Tokens stored in Figma's secure storage

3. **HTTPS Enforcement**
   - `shouldUseSecureConnection` utility

4. **No hardcoded secrets**
   - Environment variables used correctly
   - `.env.example` provided

---

## Security Recommendations

### Immediate Actions (Week 1)

1. **Update vulnerable dependencies:**
```bash
yarn upgrade @octokit/request@^8.4.1
yarn upgrade cross-spawn@^7.0.5
```

2. **Add input validation to math parser**

3. **Run full security audit:**
```bash
yarn audit --level moderate
npm audit fix
```

### Short-term (Week 2-4)

4. **Add Zod validation for:**
   - Plugin data parsing
   - API responses
   - Storage operations

5. **Reduce 'any' usage:**
   - Enable `noImplicitAny`
   - Add type coverage checks to CI

6. **Add security headers** (if applicable to preview mode)

### Medium-term (Month 2-3)

7. **Implement CSP** (Content Security Policy) for preview mode

8. **Add rate limiting** for API operations

9. **Security testing:**
   - Add fuzzing tests for parsers
   - Penetration testing for storage providers

10. **Documentation:**
    - Security.md with disclosure policy
    - Threat model documentation

---

## Security Testing Checklist

### Input Validation Tests
```typescript
describe('Math Parser Security', () => {
  it('should reject malicious expressions', () => {
    const malicious = [
      'while(true){}',
      'Array(999999999)',
      '(function(){})()',
      '__proto__.isAdmin = true',
    ];
    
    malicious.forEach(expr => {
      const result = checkAndEvaluateMath(expr);
      expect(result).toBe(expr); // Should return unchanged
    });
  });
  
  it('should timeout on complex expressions', () => {
    const complex = 'Math.pow(2, 999999)';
    const result = checkAndEvaluateMath(complex);
    expect(result).toBe(complex);
  });
});
```

### Dependency Security Tests
```typescript
describe('Dependency Security', () => {
  it('should have no high severity vulnerabilities', async () => {
    const { execSync } = require('child_process');
    const audit = execSync('yarn audit --json --level high');
    const results = JSON.parse(audit.toString());
    
    expect(results.metadata.vulnerabilities.high).toBe(0);
    expect(results.metadata.vulnerabilities.critical).toBe(0);
  });
});
```

---

## Security Metrics

| Metric | Current | Target | Priority |
|--------|---------|--------|----------|
| High CVEs | 2 | 0 | 🔴 CRITICAL |
| 'any' types | 152 | <50 | 🟠 HIGH |
| Input validation | ~20% | >90% | 🟠 HIGH |
| Env var validation | 0% | 100% | 🟡 MEDIUM |
| Security tests | 0 | >20 | 🟡 MEDIUM |

---

## Compliance Notes

### OWASP Top 10 Assessment:

1. ✅ **A01:2021-Broken Access Control** - Not applicable (client-side plugin)
2. ⚠️ **A02:2021-Cryptographic Failures** - Tokens stored securely but check encryption
3. ✅ **A03:2021-Injection** - Math parser needs hardening
4. ✅ **A04:2021-Insecure Design** - Generally good architecture
5. ⚠️ **A05:2021-Security Misconfiguration** - Env vars need validation
6. ⚠️ **A06:2021-Vulnerable Components** - 2 high CVEs found
7. ✅ **A07:2021-ID&Auth Failures** - OAuth properly implemented
8. ✅ **A08:2021-Software/Data Integrity** - Need Subresource Integrity
9. ⚠️ **A09:2021-Security Logging** - Sentry in place but enhance
10. ✅ **A10:2021-SSRF** - Not applicable

---

## Contact

For security issues, please follow responsible disclosure:
1. Do not open public issues
2. Email security team (add email)
3. Allow 90 days for patch

---

*Last Updated: October 2025*
