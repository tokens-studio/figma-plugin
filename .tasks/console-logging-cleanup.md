# Console Logging Cleanup

**Priority**: Medium  
**Type**: Code Quality  
**Effort**: Small (< 1 day)  

## Problem Description

The codebase contains **159 console.log/error/warn statements** scattered throughout the source code, many of which are debug statements that should not be in production code.

### Issues:
- **Production Noise**: Console statements clutter browser dev tools for users
- **Performance Impact**: Unnecessary logging can impact performance in production
- **Security Risk**: May inadvertently log sensitive information
- **Code Quality**: Indicates lack of proper logging strategy

### Examples Found:
```typescript
// src/storage/GithubTokenStorage.ts:272
console.error('Error', e);

// Various test files showing error output
console.error(err);
```

## Business Impact

- **User Experience**: Cluttered console in production builds affects debugging for users
- **Support Burden**: Console noise makes it harder to identify real issues
- **Professional Image**: Console logging in production appears unprofessional
- **Performance**: Unnecessary string interpolation and logging overhead

## Success Criteria

- [ ] Reduce console statements by 80% (from 159 to <30)
- [ ] Replace debug console statements with proper logging utility
- [ ] Maintain error logging only for genuine error conditions
- [ ] No console output in production builds (except genuine errors)
- [ ] Consistent logging pattern across the codebase

## Implementation Plan

### Phase 1: Audit and Categorize (2 hours)
1. **Categorize Console Usage**:
   ```bash
   # Find all console statements
   grep -r "console\." src --include="*.ts" --include="*.tsx" | \
   awk '{print $1}' | sort | uniq -c | sort -nr
   ```

2. **Categories**:
   - **Debug statements**: Remove entirely
   - **Error logging**: Keep but improve
   - **Development aids**: Replace with dev-only logging
   - **User feedback**: Replace with proper UI notifications

### Phase 2: Create Logging Utility (2 hours)
1. **Logger Implementation**:
   ```typescript
   // src/utils/logger.ts
   export const logger = {
     debug: (message: string, data?: any) => {
       if (process.env.NODE_ENV === 'development') {
         console.log(`[DEBUG] ${message}`, data);
       }
     },
     warn: (message: string, data?: any) => {
       console.warn(`[WARN] ${message}`, data);
     },
     error: (message: string, error?: Error) => {
       console.error(`[ERROR] ${message}`, error);
       // Optionally send to Sentry in production
     }
   };
   ```

### Phase 3: Replace Console Statements (4 hours)
1. **Debug Statements** → Remove:
   ```typescript
   // BEFORE
   console.log('Setting up provider...', provider);
   
   // AFTER  
   // Remove entirely or replace with:
   logger.debug('Setting up provider', { provider: provider.name });
   ```

2. **Error Statements** → Improve:
   ```typescript
   // BEFORE
   console.error(err);
   
   // AFTER
   logger.error('Failed to fetch tokens from storage', err);
   ```

3. **Development Aids** → Use Logger:
   ```typescript
   // BEFORE
   console.warn('Potential issue with token format');
   
   // AFTER
   logger.warn('Potential issue with token format', { tokenFormat });
   ```

## Target Files

Based on the analysis, focus on these high-impact areas:

```
High Priority (Many console statements):
- src/storage/ (all storage provider files)
- src/plugin/ (controller and worker files)
- src/app/store/ (state management files)

Medium Priority:
- src/utils/ (utility functions)
- src/hooks/ (React hooks)

Low Priority:
- Test files (keep for debugging tests)
```

## Implementation Rules

1. **Production Safety**:
   ```typescript
   // Never log sensitive data
   ❌ console.log('User token:', token);
   ✅ logger.debug('User authenticated successfully');
   ```

2. **Error Context**:
   ```typescript
   // Provide context with errors
   ❌ console.error(err);
   ✅ logger.error('Failed to save tokens to GitHub', err);
   ```

3. **Development Only**:
   ```typescript
   // Use logger.debug for development-only logs
   ❌ console.log('Processing token set:', tokenSet);
   ✅ logger.debug('Processing token set', { setName: tokenSet.name });
   ```

## Logging Standards

### Error Levels:
- **ERROR**: Production errors that need immediate attention
- **WARN**: Potential issues that don't break functionality  
- **DEBUG**: Development-only information

### Message Format:
```typescript
// Good: Descriptive, actionable messages
logger.error('Failed to authenticate with GitHub API', error);
logger.warn('Token format may be outdated', { version, expectedVersion });
logger.debug('Applying tokens to Figma nodes', { nodeCount, tokenCount });

// Bad: Vague, non-actionable messages  
logger.error('Error', error);
logger.warn('Something wrong');
logger.debug('Debug info', data);
```

## Integration with Existing Tools

1. **Sentry Integration**:
   ```typescript
   // In production, errors should go to Sentry
   logger.error('Storage provider failed', error); // → Sentry
   ```

2. **Development Tools**:
   ```typescript
   // Debug logs only in development
   logger.debug('Token transformation complete'); // → console (dev only)
   ```

## Verification Steps

1. **Before/After Audit**:
   ```bash
   # Count console statements before cleanup
   grep -r "console\." src --include="*.ts" --include="*.tsx" | wc -l
   
   # After cleanup, should be <30
   ```

2. **Production Build Check**:
   ```bash
   # No debug logs in production build
   yarn build && grep -r "console\.log" dist/ | wc -l  # Should be 0
   ```

3. **Error Logging Test**:
   - Trigger known error conditions
   - Verify errors are properly logged with context
   - Ensure no sensitive data is logged

## Files to Modify

```typescript
CREATE: src/utils/logger.ts
MODIFY: ~50-80 files containing console statements
UPDATE: All storage provider files
UPDATE: Plugin controller and worker files  
UPDATE: State management files
```

## Risk Mitigation

- **Preserve Error Information**: Don't remove important error logging
- **Development Experience**: Ensure debugging remains easy in development
- **Gradual Rollout**: Can implement file by file to avoid breaking changes
- **Testing**: All existing functionality should continue working