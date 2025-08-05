# Storage Test Deduplication

**Priority**: High  
**Type**: Code Quality  
**Effort**: Medium (2-3 days)  

## Problem Description

Massive code duplication exists across storage provider tests, with nearly identical test patterns repeated for GitHub, GitLab, Azure DevOps, and Bitbucket storage providers.

### Current State:
- **4,287 lines** across 9 storage test files
- **108 test cases** with similar patterns
- Each provider (GitHub, GitLab, ADO, Bitbucket) repeats the same test logic
- Difficult to maintain - changes require updates in multiple files
- High risk of inconsistencies between provider tests

### Examples of Duplication:
```typescript
// Same pattern repeated across all git providers:
Object.values(contextMap).forEach((context) => {
  it(`Pull tokens from ${context.provider}, should return credential error...`, async () => {
    // Identical logic repeated 4+ times
  });
});
```

## Business Impact

- **Maintenance Burden**: Any test updates require changes in multiple files
- **Inconsistency Risk**: Providers may diverge in test coverage
- **Development Velocity**: New storage providers require duplicating entire test suites
- **Code Review Overhead**: Large, repetitive test files are hard to review

## Success Criteria

- [ ] Reduce storage test lines by 50% (from ~4,287 to ~2,000 lines)
- [ ] Create reusable test factory for storage providers
- [ ] Maintain 100% test coverage for all storage providers
- [ ] All existing tests continue to pass
- [ ] New storage providers can reuse test infrastructure

## Implementation Plan

### Phase 1: Create Test Abstractions (1 day)
1. **Base Test Factory**:
   ```typescript
   // Create shared test utilities
   createStorageProviderTestSuite(providerConfig, specificTests?)
   ```

2. **Common Test Scenarios**:
   - Authentication tests
   - Read/write operations
   - Branch management
   - Error handling
   - Multi-file sync scenarios

### Phase 2: Refactor Existing Tests (2 days)  
1. **Extract Common Patterns**:
   - `testAuthentication(provider, config)`
   - `testReadOperations(provider, config)`
   - `testWriteOperations(provider, config)`
   - `testBranchOperations(provider, config)`
   - `testErrorHandling(provider, config)`

2. **Provider-Specific Tests**:
   - Keep only unique functionality tests for each provider
   - GitHub: GitHub-specific API features
   - GitLab: GitLab-specific group permissions
   - ADO: Azure DevOps-specific project features
   - Bitbucket: Bitbucket-specific workspace features

### Phase 3: Optimize Test Data (1 day)
1. **Shared Mock Data**:
   ```typescript
   // Centralized test fixtures
   const commonMockResponses = {
     tokenData: { global: [{ name: 'primary', type: 'color', value: '#000' }] },
     branches: ['main', 'develop'],
     commitData: { sha: 'abc123', message: 'Initial commit' }
   }
   ```

2. **Provider-Specific Fixtures**:
   - Only include data that's unique to each provider's API
   - Reuse common structures where possible

## Proposed File Structure

```
src/storage/__tests__/
├── shared/
│   ├── StorageTestFactory.ts          # Main test factory
│   ├── CommonTestScenarios.ts         # Reusable test functions
│   ├── MockData.ts                    # Shared test fixtures
│   └── TestUtilities.ts               # Helper functions
├── GithubTokenStorage.test.ts         # GitHub-specific tests only
├── GitlabTokenStorage.test.ts         # GitLab-specific tests only
├── ADOTokenStorage.test.ts            # ADO-specific tests only
└── BitbucketTokenStorage.test.ts      # Bitbucket-specific tests only
```

## Implementation Example

```typescript
// StorageTestFactory.ts
export function createStorageProviderTestSuite(
  name: string,
  createProvider: () => StorageProvider,
  config: ProviderTestConfig
) {
  describe(`${name} Storage Provider`, () => {
    let provider: StorageProvider;
    
    beforeEach(() => {
      provider = createProvider();
    });
    
    // Common tests for all providers
    testAuthentication(provider, config);
    testReadOperations(provider, config);
    testWriteOperations(provider, config);
    
    if (config.supportsBranches) {
      testBranchOperations(provider, config);
    }
    
    if (config.supportsMultiFile) {
      testMultiFileOperations(provider, config);
    }
  });
}

// GithubTokenStorage.test.ts
import { createStorageProviderTestSuite } from './shared/StorageTestFactory';

createStorageProviderTestSuite('GitHub', 
  () => new GithubTokenStorage('token', 'owner', 'repo'),
  {
    supportsBranches: true,
    supportsMultiFile: true,
    apiType: 'github'
  }
);

// GitHub-specific tests only
describe('GitHub-specific features', () => {
  it('should handle GitHub Apps authentication', () => {
    // Test GitHub-specific auth
  });
});
```

## Migration Strategy

1. **Parallel Development**: Build new test structure alongside existing tests
2. **Gradual Migration**: Move one provider at a time to new structure
3. **Validation**: Ensure test coverage remains identical during migration
4. **Cleanup**: Remove old test files only after new structure is proven

## Risk Mitigation

- **Coverage Verification**: Run coverage reports before/after migration
- **Test Validation**: Ensure all existing test scenarios are covered
- **Provider Isolation**: Each provider can still have unique tests
- **Rollback Plan**: Keep old tests until new structure is fully validated

## Files to Create/Modify

```
CREATE: packages/tokens-studio-for-figma/src/storage/__tests__/shared/
MODIFY: All existing storage test files
UPDATE: jest.config.ts (if needed for new test structure)
```