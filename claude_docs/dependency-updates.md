# Dependency Management and Updates

## Overview
Analysis of the project's dependencies, vulnerabilities, and update recommendations.

---

## 🔴 CRITICAL: Security Vulnerabilities

### Summary
- **High severity:** 2 vulnerabilities
- **Moderate severity:** Multiple (needs full audit)
- **Total advisories:** Multiple transitive dependencies

---

### 1. CVE-2025-25290: @octokit/request ReDoS

**Current Version:** `5.6.3`  
**Fixed Version:** `8.4.1+`  
**Severity:** HIGH (CVSS 5.3)

**Dependency Chain:**
```
@tokens-studio/figma-plugin
  └── @octokit/rest@18.9.0
      └── @octokit/core
          └── @octokit/request@5.6.3  ← Vulnerable
```

**Update Command:**
```bash
# Direct update (if possible)
yarn upgrade @octokit/request@^8.4.1

# Or update parent package
yarn upgrade @octokit/rest@^20.0.0
```

**Verification:**
```bash
yarn why @octokit/request
yarn audit | grep @octokit/request
```

---

### 2. CVE-2024-21538: cross-spawn ReDoS

**Current Version:** `5.1.0`  
**Fixed Version:** `7.0.5+`  
**Severity:** HIGH (CVSS 7.5)

**Dependency Chain:**
```
@changesets/cli
  └── spawndamnit
      └── cross-spawn@5.1.0  ← Vulnerable
```

**Note:** This is a dev dependency, so impact is limited to build/release process.

**Update Command:**
```bash
# Update @changesets/cli to latest
yarn upgrade @changesets/cli@latest

# Verify cross-spawn is updated
yarn why cross-spawn
```

---

## 🟠 HIGH: Outdated Dependencies

### Major Version Updates Needed

#### 1. Webpack Ecosystem

**Current:**
```json
"webpack": "5",
"webpack-cli": "^3.3.6",
"webpack-dev-server": "3.x"
```

**Recommended:**
```json
"webpack": "^5.89.0",
"webpack-cli": "^5.1.4",
"webpack-dev-server": "^4.15.1"
```

**Breaking Changes:**
- webpack-dev-server 4.x has different API
- May need to update webpack.config.js

**Migration Guide:**
```typescript
// webpack.config.js changes for v4
module.exports = {
  // Old (v3)
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    // ...
  },
  
  // New (v4)
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    // ...
  }
}
```

---

#### 2. React Testing Library

**Current:**
```json
"@testing-library/react": "^14.1.0",
"react-test-renderer": "17.0.0"  ← Mismatched!
```

**Issue:** react-test-renderer is on v17 but React is v18

**Fix:**
```bash
yarn upgrade react-test-renderer@^18.2.0
```

---

#### 3. Storybook (if used)

**Current:** `^6.5.8`  
**Latest:** `^7.6.0`

**Recommendation:** Defer until Storybook 8.0 stabilizes

---

### Minor Updates Recommended

| Package | Current | Latest | Risk |
|---------|---------|--------|------|
| typescript | 4.7.4 | 5.3.3 | 🟡 Medium |
| @types/react | 18.2.37 | 18.2.48 | 🟢 Low |
| @types/node | 20.8.5 | 20.10.6 | 🟢 Low |
| prettier | 2.0.5 | 3.1.1 | 🟡 Medium |
| jest | 29.7.0 | 29.7.0 | ✅ Latest |

---

## 🟡 MEDIUM: Dependency Health

### 1. Deprecated Packages

**Check for deprecated packages:**
```bash
npx check-is-deprecated
```

**Known deprecated:**
- `tslint` - Use ESLint with TypeScript plugin instead (already doing this ✅)

---

### 2. License Compliance

**Check licenses:**
```bash
npx license-checker --summary
```

**Ensure all dependencies use compatible licenses:**
- MIT ✅
- Apache-2.0 ✅
- ISC ✅
- BSD-* ✅
- Avoid: GPL, AGPL (copyleft issues)

---

### 3. Bundle Size Impact

**Analyze bundle size:**
```bash
yarn build
npx webpack-bundle-analyzer dist/stats.json
```

**Large dependencies to review:**

| Package | Size | Necessity | Alternative |
|---------|------|-----------|-------------|
| moment.js | ~230kb | ❌ If present | date-fns (2kb) |
| lodash | ~70kb | ⚠️ If full | lodash-es + tree-shaking |
| monaco-editor | ~2.8MB | ✅ Required | - |
| @apollo/client | ~200kb | ✅ If used | - |

**Check actual usage:**
```bash
grep -r "import.*from 'lodash'" src
# If found, prefer:
import debounce from 'lodash/debounce'; // Tree-shakeable
```

---

## 🟢 POSITIVE: Good Dependency Practices

### 1. Lock File Present ✅
- `yarn.lock` committed
- Ensures reproducible builds

### 2. Workspaces Used ✅
```json
"workspaces": {
  "packages": ["apps/*", "packages/*"]
}
```

### 3. Resolutions for Compatibility ✅
```json
"resolutions": {
  "react": "^18",
  "@radix-ui/react-dismissable-layer": "1.0.5"
}
```

---

## Dependency Update Strategy

### Phase 1: Security Updates (Immediate)

```bash
# 1. Update vulnerable dependencies
yarn upgrade @octokit/request@^8.4.1
yarn upgrade @changesets/cli@latest

# 2. Verify fixes
yarn audit --level high

# 3. Test
yarn test
yarn build
```

**Expected issues:** May need to update @octokit/rest types

---

### Phase 2: Critical Updates (Week 1-2)

```bash
# 1. React testing ecosystem
yarn upgrade react-test-renderer@^18.2.0

# 2. Type definitions
yarn upgrade @types/react@latest @types/node@latest

# 3. Test
yarn test
```

---

### Phase 3: Major Updates (Week 3-4)

```bash
# 1. Webpack ecosystem
yarn upgrade webpack@^5.89.0
yarn upgrade webpack-cli@^5.1.4
yarn upgrade webpack-dev-server@^4.15.1

# 2. Update webpack config
# (See migration guide above)

# 3. Test build process
yarn build
yarn start
```

---

### Phase 4: TypeScript 5 Migration (Month 2)

**Plan:**
1. Read TypeScript 5.0, 5.1, 5.2, 5.3 release notes
2. Update tsconfig.json for new features
3. Fix any breaking changes
4. Leverage new features (decorators, const type parameters, etc.)

```bash
yarn upgrade typescript@^5.3.3
```

**Potential issues:**
- Stricter type checking
- New errors from improved inference
- Module resolution changes

---

## Automated Dependency Management

### 1. Setup Renovate Bot

**Create:** `.github/renovate.json`
```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "matchCurrentVersion": ">=1.0.0",
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["^@types/"],
      "automerge": true
    }
  ],
  "schedule": ["before 3am on Monday"],
  "timezone": "America/New_York"
}
```

**Benefits:**
- Automatic PR creation for updates
- Grouped updates (e.g., all @types packages)
- Security updates prioritized
- Configurable auto-merge

---

### 2. Dependabot Configuration

**Alternative:** `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team-maintainers"
    labels:
      - "dependencies"
    ignore:
      # Ignore major version updates for complex packages
      - dependency-name: "webpack"
        update-types: ["version-update:semver-major"]
      - dependency-name: "webpack-dev-server"
        update-types: ["version-update:semver-major"]
```

---

### 3. Dependency Check Script

**Create:** `scripts/check-deps.sh`
```bash
#!/bin/bash

echo "🔍 Checking for security vulnerabilities..."
yarn audit --level moderate

echo "\n📦 Checking for outdated packages..."
yarn outdated

echo "\n⚠️  Checking for deprecated packages..."
npx check-is-deprecated

echo "\n📄 Checking licenses..."
npx license-checker --summary

echo "\n📊 Dependency report generated!"
```

**Run regularly:**
```bash
chmod +x scripts/check-deps.sh
./scripts/check-deps.sh > dependency-report.txt
```

---

## Dependency Hygiene Checklist

### Weekly Tasks
- [ ] Review Renovate/Dependabot PRs
- [ ] Check for new security advisories
- [ ] Monitor bundle size impact

### Monthly Tasks
- [ ] Run full dependency audit
- [ ] Review outdated packages
- [ ] Check for deprecated packages
- [ ] Update lock file if stale

### Quarterly Tasks
- [ ] Plan major version updates
- [ ] Review dependency tree for bloat
- [ ] Evaluate alternatives for large deps
- [ ] Update dependency documentation

---

## CI/CD Integration

### Add to GitHub Actions

**Create:** `.github/workflows/dependencies.yml`
```yaml
name: Dependency Checks

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'yarn'
      
      - name: Install dependencies
        run: yarn install --frozen-lockfile
      
      - name: Security audit
        run: yarn audit --level moderate
        continue-on-error: true
      
      - name: Check outdated
        run: yarn outdated
        continue-on-error: true
      
      - name: Create issue if vulnerabilities found
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '⚠️ Security vulnerabilities detected',
              body: 'Automated security scan found vulnerabilities. Please review.',
              labels: ['security', 'dependencies']
            })
```

---

## Monitoring and Alerts

### 1. Socket.dev Integration
- Real-time security monitoring
- Supply chain attack detection
- Alerts for suspicious packages

### 2. Snyk Integration
- Continuous vulnerability scanning
- Fix PRs automatically created
- License compliance checking

### 3. GitHub Security Advisories
- Enable Dependabot alerts
- Review advisories weekly
- Subscribe to npm security bulletins

---

## Summary

| Action | Priority | Effort | Impact |
|--------|----------|--------|--------|
| Fix CVE-2025-25290 | 🔴 Critical | Low | High |
| Fix CVE-2024-21538 | 🔴 Critical | Low | Medium |
| Update react-test-renderer | 🟠 High | Low | Low |
| Update webpack ecosystem | 🟠 High | High | Medium |
| TypeScript 5 migration | 🟡 Medium | Medium | Medium |
| Setup Renovate/Dependabot | 🟡 Medium | Low | High |

---

## Dependency Update Commands

### Quick Security Fix
```bash
# Run this immediately
yarn upgrade @octokit/request@^8.4.1
yarn upgrade @changesets/cli@latest
yarn audit
yarn test
```

### Full Update (Carefully)
```bash
# 1. Backup current state
git checkout -b dependency-updates

# 2. Interactive update
yarn upgrade-interactive --latest

# 3. Review changes
git diff yarn.lock

# 4. Test thoroughly
yarn test
yarn build
yarn start

# 5. Commit if successful
git add .
git commit -m "chore: update dependencies"
```

---

*Dependency analysis completed October 2025*
