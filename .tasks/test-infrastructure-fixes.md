# Test Infrastructure Fixes

**Priority**: High  
**Type**: Bug Fix  
**Effort**: Medium (1-3 days)  

## Problem Description

Currently 5 tests are failing out of 1,357 total tests, indicating test infrastructure issues that could impact development workflow and CI/CD reliability.

### Failing Tests:
1. `AddLicenseKey.test.tsx` - UI component test failing on findByRole for 'removeKey' button
2. `GithubTokenStorage.test.ts` - Multiple console errors related to JSON parsing and authentication

### Root Causes:
- Flaky test assertions with timing issues
- Improper mocking in storage provider tests 
- UI component tests with fragile selectors
- Race conditions in async test operations

## Business Impact

- **Developer Productivity**: Failing tests block development and require manual intervention
- **CI/CD Reliability**: Unreliable tests can mask real issues or block deployments
- **Code Quality**: Teams may start ignoring test failures, reducing overall quality

## Success Criteria

- [ ] All 1,357 tests pass consistently 
- [ ] Test run time remains under 70 seconds
- [ ] No console errors during test execution
- [ ] Tests pass reliably in CI environment

## Implementation Plan

### Phase 1: Fix Immediate Failures (1 day)
1. **AddLicenseKey.test.tsx**:
   - Review button naming/accessibility labels
   - Add proper `waitFor` for async operations
   - Use `screen.getByRole` instead of `findByRole` where appropriate
   
2. **GithubTokenStorage.test.ts**:
   - Fix JSON.parse errors by ensuring proper mock data format
   - Mock all external API calls properly
   - Remove/mock console.error statements in tests

### Phase 2: Improve Test Stability (2 days)
1. **Enhance Test Utilities**:
   - Create helper functions for common async operations
   - Standardize mock setups across storage provider tests
   - Add better error handling in test utilities

2. **Fix Timing Issues**:
   - Replace arbitrary timeouts with proper `waitFor` conditions
   - Ensure all async operations are properly awaited
   - Add retry logic for occasionally flaky assertions

### Phase 3: Prevent Future Issues (1 day)
1. **Test Documentation**:
   - Document testing patterns and best practices
   - Create examples of proper mocking for storage providers
   - Add guidelines for UI component testing

2. **CI Improvements**:
   - Add test retry logic for flaky tests
   - Improve test output formatting for easier debugging
   - Consider splitting tests into faster parallel runs

## Files to Modify

```
packages/tokens-studio-for-figma/src/app/components/AddLicenseKey/AddLicenseKey.test.tsx
packages/tokens-studio-for-figma/src/storage/__tests__/GithubTokenStorage.test.ts
packages/tokens-studio-for-figma/jest.config.ts (potentially)
```

## Technical Notes

- Use `@testing-library/jest-dom` matchers for better assertions
- Consider using `MSW` (Mock Service Worker) for more realistic API mocking
- Ensure all storage provider tests follow the same patterns
- Add proper cleanup in test teardown phases

## Verification Steps

1. Run `yarn test` locally - should pass all tests
2. Run tests in CI environment - should pass consistently  
3. Run tests multiple times - should not be flaky
4. Check test coverage doesn't decrease
5. Verify no new console errors are introduced