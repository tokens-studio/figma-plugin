# Error Handling Improvements

**Priority**: Medium  
**Type**: Code Quality  
**Effort**: Medium (2-3 days)  

## Problem Description

Storage providers and other critical components lack consistent error handling patterns, leading to poor user experience and difficult debugging.

### Current Issues:
- **Inconsistent Error Messages**: Different providers return different error formats
- **Generic Error Handling**: Many catch blocks just log errors without context
- **Poor User Feedback**: Errors don't provide actionable guidance to users
- **Missing Error Boundaries**: Some error conditions can crash the entire UI

### Examples from Analysis:
```typescript
// Generic, unhelpful error handling
} catch (e) {
  console.error('Error', e);
  return [];
}

// No user-friendly error messages
throw new Error('Unable to find directory, companyA/ds');
```

## Business Impact

- **User Experience**: Cryptic error messages confuse users
- **Support Burden**: Support team gets generic error reports
- **Development Velocity**: Poor error context slows debugging
- **User Trust**: Frequent unexplained errors reduce user confidence

## Success Criteria

- [ ] Consistent error handling patterns across all storage providers
- [ ] User-friendly error messages with actionable guidance
- [ ] Proper error categorization (network, auth, validation, etc.)
- [ ] Error boundaries prevent UI crashes
- [ ] Comprehensive error logging for debugging
- [ ] Error recovery mechanisms where possible

## Implementation Plan

### Phase 1: Define Error Standards (1 day)

1. **Error Categories**:
   ```typescript
   // src/types/ErrorTypes.ts
   export enum ErrorType {
     NETWORK = 'network',
     AUTHENTICATION = 'authentication', 
     AUTHORIZATION = 'authorization',
     VALIDATION = 'validation',
     NOT_FOUND = 'not_found',
     RATE_LIMIT = 'rate_limit',
     UNKNOWN = 'unknown'
   }
   
   export interface AppError {
     type: ErrorType;
     code: string;
     message: string;
     userMessage: string;
     cause?: Error;
     context?: Record<string, any>;
   }
   ```

2. **Error Factory**:
   ```typescript
   // src/utils/errors.ts
   export class AppErrorFactory {
     static createNetworkError(cause: Error): AppError {
       return {
         type: ErrorType.NETWORK,
         code: 'NETWORK_ERROR',
         message: 'Network request failed',
         userMessage: 'Unable to connect. Please check your internet connection.',
         cause
       };
     }
     
     static createAuthError(provider: string): AppError {
       return {
         type: ErrorType.AUTHENTICATION,
         code: 'AUTH_ERROR', 
         message: `Authentication failed for ${provider}`,
         userMessage: `Please check your ${provider} credentials and try again.`,
         context: { provider }
       };
     }
   }
   ```

### Phase 2: Standardize Storage Provider Errors (1 day)

1. **Base Storage Error Handler**:
   ```typescript
   // src/storage/BaseStorageProvider.ts
   abstract class BaseStorageProvider {
     protected handleStorageError(error: Error, operation: string): AppError {
       if (error.message.includes('401') || error.message.includes('403')) {
         return AppErrorFactory.createAuthError(this.providerName);
       }
       
       if (error.message.includes('network') || error.message.includes('fetch')) {
         return AppErrorFactory.createNetworkError(error);
       }
       
       return AppErrorFactory.createGenericError(error, operation);
     }
   }
   ```

2. **Update Storage Providers**:
   ```typescript
   // Example: GithubTokenStorage.ts
   async read(): Promise<RemoteTokenStorageData[] | AppError> {
     try {
       const data = await this.fetchFromGitHub();
       return this.parseTokenData(data);
     } catch (error) {
       const appError = this.handleStorageError(error, 'read');
       logger.error('GitHub read operation failed', appError);
       return appError;
     }
   }
   ```

### Phase 3: Improve User Error Experience (1 day)

1. **Error Notification Component**:
   ```typescript
   // src/app/components/ErrorNotification.tsx
   export function ErrorNotification({ error }: { error: AppError }) {
     const getActionButton = (error: AppError) => {
       switch (error.type) {
         case ErrorType.AUTHENTICATION:
           return <Button onClick={openAuthSettings}>Update Credentials</Button>;
         case ErrorType.NETWORK:
           return <Button onClick={retryOperation}>Retry</Button>;
         default:
           return null;
       }
     };
     
     return (
       <Alert variant="error">
         <AlertTitle>{error.userMessage}</AlertTitle>
         <AlertDescription>{getErrorDetails(error)}</AlertDescription>
         {getActionButton(error)}
       </Alert>
     );
   }
   ```

2. **Error Recovery Mechanisms**:
   ```typescript
   // Automatic retry for network errors
   async function withRetry<T>(
     operation: () => Promise<T>,
     maxRetries = 3
   ): Promise<T | AppError> {
     for (let attempt = 1; attempt <= maxRetries; attempt++) {
       try {
         return await operation();
       } catch (error) {
         if (attempt === maxRetries || !isRetryableError(error)) {
           return AppErrorFactory.createFromError(error);
         }
         await delay(attempt * 1000); // Exponential backoff
       }
     }
   }
   ```

## Specific Error Scenarios to Address

### 1. Storage Provider Errors
```typescript
// Authentication errors
"Invalid GitHub token" → "GitHub authentication failed. Please update your token in Settings."

// Network errors  
"fetch failed" → "Unable to connect to GitHub. Please check your internet connection and try again."

// Permission errors
"403 Forbidden" → "You don't have permission to access this repository. Please check your repository permissions."

// Rate limiting
"API rate limit exceeded" → "GitHub API rate limit reached. Please wait a few minutes before trying again."
```

### 2. Validation Errors
```typescript
// Token format errors
"Invalid token format" → "The token file format is invalid. Please check the token structure and try again."

// Missing required fields
"Missing token name" → "Token names are required. Please add a name to all tokens."
```

### 3. File Operation Errors
```typescript
// File not found
"File not found" → "The tokens file doesn't exist yet. Create your first token to get started."

// Permission denied
"Permission denied" → "Unable to save changes. Please check your repository write permissions."
```

## Error Boundaries Implementation

```typescript
// src/app/components/ErrorBoundary.tsx
export class StorageErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Storage operation failed', error, { errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    
    return this.props.children;
  }
}
```

## Testing Error Scenarios

```typescript
// src/storage/__tests__/ErrorHandling.test.ts
describe('Storage Provider Error Handling', () => {
  it('should handle authentication errors gracefully', async () => {
    mockApi.mockRejectedValue(new Error('401 Unauthorized'));
    
    const result = await provider.read();
    
    expect(result).toEqual({
      type: ErrorType.AUTHENTICATION,
      userMessage: expect.stringContaining('authentication failed')
    });
  });
  
  it('should retry network errors automatically', async () => {
    mockApi
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValue(mockData);
    
    const result = await withRetry(() => provider.read());
    
    expect(mockApi).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockData);
  });
});
```

## Files to Create/Modify

```
CREATE: src/types/ErrorTypes.ts
CREATE: src/utils/errors.ts
CREATE: src/utils/retry.ts
CREATE: src/app/components/ErrorBoundary.tsx
CREATE: src/app/components/ErrorNotification.tsx

MODIFY: All storage provider files
MODIFY: src/app/store/remoteTokens.ts
MODIFY: Plugin controller files
MODIFY: Error handling in UI components
```

## Migration Strategy

1. **Gradual Implementation**: Start with most critical storage providers
2. **Backward Compatibility**: Maintain existing error handling during transition
3. **User Testing**: Test error scenarios with real users
4. **Documentation**: Update error handling guidelines for contributors

## Monitoring and Metrics

- Track error rates by type and provider
- Monitor user retry rates after error messages
- Measure support ticket reduction for common errors
- User satisfaction with error message clarity