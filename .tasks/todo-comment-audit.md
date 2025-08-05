# TODO Comment Audit and Resolution

**Priority**: Low  
**Type**: Code Quality  
**Effort**: Small (< 1 day)  

## Problem Description

The codebase contains **77 TODO/FIXME comments** that represent unfinished work, known issues, or areas needing improvement. These comments indicate technical debt that should be addressed.

### Issues:
- **Unfinished Features**: TODOs for features that may never get completed
- **Known Issues**: FIXMEs for problems that could affect users
- **Code Quality**: Areas marked for improvement but never addressed
- **Documentation Debt**: Comments about missing documentation or cleanup

### Examples Found:
```typescript
// @TODO: This no longer seems to work for color tokens as prop is always string?
// TODO: We need to add these to the ui tokens.
// TODO: We should likely make everything 500 and get rid of 600
// FIXME: Figure out why this is a string in the plugin, are the types incorrect?
// TODO: Likely a good idea to merge this with createLocalVariablesInPlugin
```

## Business Impact

- **Technical Debt**: Accumulating unaddressed issues
- **User Experience**: Known issues (FIXMEs) may affect functionality  
- **Developer Productivity**: Unclear code intentions slow development
- **Code Quality**: Unresolved TODOs indicate incomplete work

## Success Criteria

- [ ] Reduce TODO/FIXME comments by 80% (from 77 to <15)
- [ ] Convert actionable TODOs into proper GitHub issues
- [ ] Fix critical FIXMEs that affect functionality
- [ ] Document remaining TODOs with context and timeline
- [ ] Establish process for managing future TODOs

## Implementation Plan

### Phase 1: Audit and Categorize (2 hours)

1. **Extract All TODOs**:
   ```bash
   # Find all TODO/FIXME comments
   grep -rn "TODO\|FIXME\|XXX" src --include="*.ts" --include="*.tsx" > todo-audit.txt
   
   # Categorize by type:
   # - Critical: FIXMEs affecting functionality
   # - Important: TODOs for missing features
   # - Cleanup: Code improvement TODOs
   # - Documentation: Missing docs or examples
   # - Obsolete: TODOs that are no longer relevant
   ```

2. **Priority Classification**:
   ```typescript
   // CRITICAL: Affects functionality
   "FIXME: Figure out why this is a string in the plugin, are the types incorrect?"
   
   // IMPORTANT: Missing features that users need
   "TODO: Add support for nested token references"
   
   // CLEANUP: Code quality improvements
   "TODO: Refactor this function to be more readable"
   
   // DOCUMENTATION: Missing documentation
   "TODO: Add JSDoc comments to this function"
   
   // OBSOLETE: No longer relevant
   "TODO: Remove this once we upgrade React to v18" (already on v18)
   ```

### Phase 2: Address Critical FIXMEs (2 hours)

1. **Type Safety Issues**:
   ```typescript
   // BEFORE:
   // FIXME: Figure out why this is a string in the plugin, are the types incorrect?
   rawValue: '#ff0000' as any,
   
   // AFTER: Investigate and fix properly
   rawValue: parseColorValue('#ff0000'), // with proper type conversion
   ```

2. **Functionality Issues**:
   ```typescript
   // BEFORE:
   // @TODO: This no longer seems to work for color tokens as prop is always string?
   if (typeof value === 'object') { /* handle object */ }
   
   // AFTER: Fix the actual issue
   if (isColorObject(value)) { /* proper type guard */ }
   ```

### Phase 3: Convert TODOs to Issues (1 hour)

1. **Create GitHub Issues**:
   ```markdown
   # Template for TODO → Issue conversion
   
   **Title**: [TODO] Add support for nested token references
   
   **Description**: 
   Currently found in `src/utils/token-resolver.ts:45`
   
   Original comment: "TODO: Add support for nested token references"
   
   **Context**: 
   Users need the ability to reference tokens within other tokens for better maintainability.
   
   **Acceptance Criteria**:
   - [ ] Support {token.name} syntax in token values
   - [ ] Handle circular reference detection
   - [ ] Update documentation with examples
   
   **Labels**: enhancement, tokens, technical-debt
   ```

2. **Replace with Issue References**:
   ```typescript
   // BEFORE:
   // TODO: Add support for nested token references
   
   // AFTER:
   // See issue #123: Add support for nested token references
   // or remove comment entirely if issue covers it
   ```

### Phase 4: Quick Cleanup TODOs (2 hours)

1. **Styling and UI Improvements**:
   ```typescript
   // BEFORE:
   // TODO: We need to add these to the ui tokens.
   colors: {
     primary: '#007bff',
     secondary: '#6c757d'
   }
   
   // AFTER: Use design tokens
   colors: {
     primary: tokens.colors.primary,
     secondary: tokens.colors.secondary
   }
   ```

2. **Code Quality Improvements**:
   ```typescript
   // BEFORE:
   // TODO: Likely a good idea to merge this with createLocalVariablesInPlugin
   function createLocalVariablesWithoutModesInPlugin() { /* ... */ }
   
   // AFTER: Either merge the functions or create issue for future refactoring
   function createLocalVariablesWithoutModesInPlugin() {
     // Specialized version for variables without modes
     // See issue #124 for potential merge with createLocalVariablesInPlugin
   }
   ```

### Phase 5: Documentation TODOs (1 hour)

1. **Add Missing Documentation**:
   ```typescript
   // BEFORE:
   // TODO: Add JSDoc comments
   function processTokens(tokens) { /* ... */ }
   
   // AFTER:
   /**
    * Processes design tokens and applies transformations
    * @param tokens - Array of design tokens to process
    * @returns Processed tokens with applied transformations
    */
   function processTokens(tokens: Token[]): ProcessedToken[] { /* ... */ }
   ```

2. **Update Examples**:
   ```typescript
   // BEFORE:
   // TODO: Add usage examples
   
   // AFTER:
   /**
    * @example
    * const result = processTokens([
    *   { name: 'primary', value: '#007bff', type: 'color' }
    * ]);
    */
   ```

## Specific TODO Categories to Address

### 1. Design System TODOs
```typescript
// Found in stitches.config.ts
"TODO: We need to add these to the ui tokens."
"TODO: We should likely make everything 500 and get rid of 600"
"TODO: We should remove this once we have a way to choose density"

// Solution: Create design system improvement issues
```

### 2. Type Safety TODOs
```typescript
// Found in plugin tests
"FIXME: Figure out why this is a string in the plugin, are the types incorrect?"

// Solution: Investigate Figma plugin API types and fix
```

### 3. Performance TODOs
```typescript
// Found in various files
"TODO: Optimize this for large datasets"
"TODO: Consider memoization here"

// Solution: Add performance benchmarks and optimize
```

### 4. Feature TODOs
```typescript
// Found in plugin code
"TODO: Add support for custom token types"
"TODO: Implement batch operations"

// Solution: Convert to product backlog items
```

## TODO Management Process

### 1. Establish Guidelines
```typescript
// Good TODO format
// TODO(issue #123): Description with context and timeline
// TODO(username): Short-term fix needed before next release

// Bad TODO format  
// TODO: fix this
// TODO: make better
```

### 2. Automated Checking
```bash
# Add to pre-commit hooks
#!/bin/bash
# Check for TODOs without issue references
grep -r "TODO:" src | grep -v "TODO(#\|TODO(\w" && {
  echo "Found TODOs without issue references"
  exit 1
}
```

### 3. Regular Cleanup
```json
// package.json script
{
  "scripts": {
    "todo-audit": "grep -r 'TODO\\|FIXME' src --include='*.ts' --include='*.tsx' | wc -l"
  }
}
```

## Implementation Strategy

### 1. Prioritized Approach
```bash
# Process by priority
1. Fix critical FIXMEs (functionality issues)
2. Address important TODOs (missing features)  
3. Clean up code quality TODOs
4. Add documentation for remaining items
5. Convert complex TODOs to GitHub issues
```

### 2. File-by-File Cleanup
```bash
# Process files with most TODOs first
grep -r "TODO\|FIXME" src --include="*.ts" --include="*.tsx" | \
  cut -d: -f1 | sort | uniq -c | sort -nr | head -10
```

## Files to Modify

Based on the analysis, these files likely need attention:
```
High TODO Density:
- src/stitches.config.ts (design system TODOs)
- src/plugin/ files (Figma API TODOs)
- src/hooks/ files (React hook improvements)
- src/storage/ files (storage provider TODOs)

Low Priority:
- Test files (test improvement TODOs)
- Configuration files (build optimization TODOs)
```

## Tracking Progress

### 1. Before/After Metrics
```bash
# Initial count
grep -r "TODO\|FIXME" src --include="*.ts" --include="*.tsx" | wc -l

# Track by category
grep -r "TODO.*ui tokens" src | wc -l
grep -r "FIXME.*types" src | wc -l
```

### 2. Quality Gates
```bash
# Add to CI to prevent TODO accumulation
if [ $(grep -r "TODO:" src | wc -l) -gt 15 ]; then
  echo "Too many TODOs found. Please convert to issues or resolve."
  exit 1
fi
```

## Success Metrics

1. **Quantitative**:
   - TODO/FIXME comments: 77 → <15
   - GitHub issues created: ~20-30 issues from TODOs
   - Critical FIXMEs resolved: 100%

2. **Qualitative**:
   - Clear code intentions
   - Proper issue tracking for future work
   - Better code maintainability
   - Improved developer experience

## Risk Mitigation

- **Don't Remove Valid TODOs**: Some TODOs represent important future work
- **Issue Creation**: Ensure important TODOs become trackable issues
- **Team Communication**: Discuss TODOs that affect multiple developers
- **Documentation**: Document the reasoning behind remaining TODOs