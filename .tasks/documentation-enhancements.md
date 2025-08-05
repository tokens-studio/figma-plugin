# Documentation Enhancements

**Priority**: Low  
**Type**: Documentation  
**Effort**: Medium (2-3 days)  

## Problem Description

While the repository has basic documentation, there are several gaps that affect developer onboarding, contribution quality, and maintainability.

### Current Documentation State:
- **README.md**: Basic setup instructions
- **developer-knowledgebase/**: Some technical documentation
- **Changeset Requirements**: Documented in copilot-instructions.md
- **Missing Areas**: Comprehensive testing guides, architecture documentation, contribution guidelines

### Gaps Identified:
- No comprehensive testing documentation
- Limited architecture overview for new contributors
- No coding standards beyond ESLint rules
- Missing troubleshooting guides for common issues
- No performance optimization guidelines
- Limited examples for extending the plugin

## Business Impact

- **Developer Onboarding**: Slower onboarding for new team members
- **Contribution Quality**: Inconsistent contributions due to unclear guidelines
- **Support Burden**: Repeated questions about setup and development
- **Knowledge Transfer**: Risk of knowledge loss when team members leave

## Success Criteria

- [ ] Comprehensive testing documentation covering all test types
- [ ] Architecture overview explaining plugin structure and patterns
- [ ] Contributing guidelines with examples and standards
- [ ] Troubleshooting guide for common development issues
- [ ] Performance guidelines for optimal development
- [ ] Code examples for common plugin extension scenarios
- [ ] Updated README with modern setup instructions

## Implementation Plan

### Phase 1: Developer Experience Documentation (1 day)

1. **Enhanced README.md**:
   ```markdown
   # Tokens Studio for Figma Plugin
   
   ## Quick Start
   ```bash
   # One-command setup
   yarn install --frozen-lockfile --immutable
   yarn start
   ```
   
   ## Development Workflow
   - Testing: `yarn test` (runs in <70s)
   - Linting: `yarn lint` (auto-fixes issues)
   - Building: `yarn build` (production-ready)
   
   ## Architecture Overview
   - UI Layer: React components in `src/app/`
   - Plugin Layer: Figma API integration in `src/plugin/`
   - Storage Layer: Token synchronization in `src/storage/`
   ```

2. **CONTRIBUTING.md**:
   ```markdown
   # Contributing to Tokens Studio
   
   ## Before You Start
   1. Read our [Architecture Guide](docs/architecture.md)
   2. Check the [Testing Guide](docs/testing.md)
   3. Review [Code Standards](docs/code-standards.md)
   
   ## Development Process
   1. **Every change requires a changeset**: `yarn changeset`
   2. **Always select "patch"** (maintainers will upgrade if needed)
   3. **Write user-facing descriptions**
   
   ## Pull Request Checklist
   - [ ] Tests pass: `yarn test`
   - [ ] Lints clean: `yarn lint`
   - [ ] Changeset included
   - [ ] Manual testing in Figma
   ```

3. **docs/troubleshooting.md**:
   ```markdown
   # Common Issues and Solutions
   
   ## Build Issues
   ### "Cannot resolve module" errors
   ```bash
   # Clear cache and reinstall
   yarn clean
   yarn install --frozen-lockfile
   ```
   
   ## Test Issues
   ### Tests timeout or hang
   ```bash
   # Run with verbose output
   yarn test --verbose --no-cache
   ```
   
   ## Figma Plugin Issues
   ### Plugin doesn't load in Figma
   1. Check console for errors
   2. Rebuild: `yarn build`
   3. Clear Figma cache
   ```

### Phase 2: Technical Architecture Documentation (1 day)

1. **docs/architecture.md**:
   ```markdown
   # Plugin Architecture
   
   ## Overview
   Tokens Studio is a Figma plugin with a unique dual-environment architecture:
   
   ```
   ┌─────────────────┐    Message Passing    ┌─────────────────┐
   │   UI (iframe)   │ ◄─────────────────► │ Figma Sandbox  │
   │                 │                      │                 │
   │ - React App     │                      │ - Plugin API    │
   │ - State Mgmt    │                      │ - Node Mgmt     │
   │ - Storage APIs  │                      │ - Variables     │
   └─────────────────┘                      └─────────────────┘
   ```
   
   ## Key Concepts
   
   ### Message Passing
   Communication between UI and sandbox happens via `postMessage`:
   ```typescript
   // UI → Sandbox
   figma.ui.postMessage({ type: 'APPLY_TOKENS', tokens });
   
   // Sandbox → UI
   figma.ui.postMessage({ type: 'SELECTION_CHANGED', nodes });
   ```
   
   ### Storage Providers
   Abstract token storage across different platforms:
   ```typescript
   interface TokenStorage {
     read(): Promise<TokenData>;
     write(data: TokenData): Promise<boolean>;
   }
   ```
   ```

2. **docs/plugin-api.md**:
   ```markdown
   # Figma Plugin API Guidelines
   
   ## Core Principles
   1. **Sandbox Isolation**: Plugin code cannot access DOM or external APIs
   2. **Message Passing**: All communication via postMessage
   3. **Async Operations**: All Figma API calls are async
   
   ## Common Patterns
   
   ### Applying Tokens to Nodes
   ```typescript
   async function applyTokens(node: SceneNode, tokens: Token[]) {
     // Always check node type first
     if (!('fills' in node)) return;
     
     // Apply with error handling
     try {
       node.fills = transformTokensToFills(tokens);
     } catch (error) {
       logger.error('Failed to apply tokens', error);
     }
   }
   ```
   
   ### Working with Variables
   ```typescript
   // Create local variables from tokens
   const collection = figma.variables.createVariableCollection('Tokens');
   const variable = figma.variables.createVariable('primary', collection);
   ```
   ```

### Phase 3: Testing and Quality Documentation (1 day)

1. **docs/testing.md**:
   ```markdown
   # Testing Guide
   
   ## Test Types
   
   ### Unit Tests (`*.test.ts`)
   ```bash
   # Run all tests
   yarn test
   
   # Run specific test file  
   yarn test TokenProcessor.test.ts
   
   # Run with coverage
   yarn test:coverage
   ```
   
   ### Integration Tests
   ```bash
   # Test storage providers
   yarn test src/storage/
   
   # Test plugin functionality
   yarn test src/plugin/
   ```
   
   ### E2E Tests
   ```bash
   # Open Cypress UI
   yarn cy:open
   
   # Run headless
   yarn cy:run
   ```
   
   ## Writing Tests
   
   ### Storage Provider Tests
   ```typescript
   describe('Storage Provider', () => {
     it('should handle authentication errors', async () => {
       mockApi.mockRejectedValue(new AuthError());
       
       const result = await provider.read();
       
       expect(result).toEqual({
         status: 'error',
         message: 'Authentication failed'
       });
     });
   });
   ```
   
   ### React Component Tests
   ```typescript
   import { render, screen } from '@testing-library/react';
   
   it('should display token list', () => {
     render(<TokenList tokens={mockTokens} />);
     
     expect(screen.getByText('Primary Color')).toBeInTheDocument();
   });
   ```
   
   ## Test Best Practices
   1. Use descriptive test names
   2. Mock external dependencies
   3. Test error conditions
   4. Keep tests focused and fast
   ```

2. **docs/code-standards.md**:
   ```markdown
   # Code Standards
   
   ## TypeScript Guidelines
   
   ### Strict Type Safety
   ```typescript
   // ✅ Good: Proper typing
   interface TokenData {
     name: string;
     value: string;
     type: TokenType;
   }
   
   // ❌ Bad: Using any
   const data: any = response;
   ```
   
   ### Error Handling
   ```typescript
   // ✅ Good: Proper error handling
   try {
     const result = await risky operation();
     return { success: true, data: result };
   } catch (error) {
     logger.error('Operation failed', error);
     return { success: false, error: error.message };
   }
   
   // ❌ Bad: Silent failures
   try {
     await riskyOperation();
   } catch {
     // Ignoring errors
   }
   ```
   
   ## React Guidelines
   
   ### Component Structure
   ```typescript
   // ✅ Good: Functional component with proper typing
   interface TokenListProps {
     tokens: Token[];
     onSelect: (token: Token) => void;
   }
   
   export function TokenList({ tokens, onSelect }: TokenListProps) {
     return (
       <div>
         {tokens.map(token => (
           <TokenItem 
             key={token.id}
             token={token}
             onClick={() => onSelect(token)}
           />
         ))}
       </div>
     );
   }
   ```
   
   ### Hooks Usage
   ```typescript
   // ✅ Good: Custom hooks for reusable logic
   function useTokenStorage() {
     const [tokens, setTokens] = useState<Token[]>([]);
     const [loading, setLoading] = useState(false);
     
     const loadTokens = useCallback(async () => {
       setLoading(true);
       try {
         const result = await storage.read();
         setTokens(result);
       } finally {
         setLoading(false);
       }
     }, []);
     
     return { tokens, loading, loadTokens };
   }
   ```
   ```

### Phase 4: Examples and Guides (1 day)

1. **docs/examples/README.md**:
   ```markdown
   # Code Examples
   
   ## Storage Provider Extension
   See [custom-storage-provider.md](custom-storage-provider.md)
   
   ## Token Transformation
   See [token-transforms.md](token-transforms.md)
   
   ## Plugin Extension
   See [plugin-extensions.md](plugin-extensions.md)
   ```

2. **docs/examples/custom-storage-provider.md**:
   ```markdown
   # Creating a Custom Storage Provider
   
   ## 1. Implement the Interface
   ```typescript
   import { RemoteTokenStorage } from '../RemoteTokenStorage';
   
   export class MyCustomStorage extends RemoteTokenStorage {
     async read(): Promise<TokenData> {
       // Implementation
     }
     
     async write(data: TokenData): Promise<boolean> {
       // Implementation  
     }
   }
   ```
   
   ## 2. Add Authentication
   ```typescript
   async authenticate(credentials: Credentials): Promise<boolean> {
     try {
       const response = await fetch('/api/auth', {
         headers: { Authorization: `Bearer ${credentials.token}` }
       });
       return response.ok;
     } catch {
       return false;
     }
   }
   ```
   
   ## 3. Handle Errors
   ```typescript
   async read(): Promise<TokenData | AppError> {
     try {
       const data = await this.fetchData();
       return this.parseTokenData(data);
     } catch (error) {
       return this.handleStorageError(error, 'read');
     }
   }
   ```
   
   ## 4. Add Tests
   ```typescript
   describe('MyCustomStorage', () => {
     it('should read tokens successfully', async () => {
       const storage = new MyCustomStorage(credentials);
       const result = await storage.read();
       expect(result).toEqual(expectedTokens);
     });
   });
   ```
   ```

## Documentation Standards

### 1. Writing Style
- **Clear and Concise**: Use simple language
- **Code Examples**: Include working code samples
- **Step-by-Step**: Break complex tasks into steps
- **Visual Aids**: Use diagrams for architecture

### 2. Code Examples
```typescript
// Always include:
// 1. Complete, runnable examples
// 2. Type annotations
// 3. Error handling
// 4. Comments explaining non-obvious parts

// ✅ Good example
/**
 * Applies color tokens to selected nodes
 * @param tokens - Color tokens to apply
 * @returns Success status and any errors
 */
async function applyColorTokens(tokens: ColorToken[]): Promise<{
  success: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  
  for (const node of figma.currentPage.selection) {
    try {
      if ('fills' in node) {
        node.fills = tokens.map(token => ({
          type: 'SOLID',
          color: hexToRgb(token.value)
        }));
      }
    } catch (error) {
      errors.push(`Failed to apply to ${node.name}: ${error.message}`);
    }
  }
  
  return { success: errors.length === 0, errors };
}
```

### 3. Documentation Structure
```
docs/
├── README.md                 # Documentation overview
├── architecture.md           # System architecture
├── testing.md               # Testing guidelines
├── code-standards.md        # Coding standards
├── troubleshooting.md       # Common issues
├── plugin-api.md           # Figma API guidelines
├── performance.md          # Performance best practices
└── examples/               # Code examples
    ├── README.md
    ├── custom-storage-provider.md
    ├── token-transforms.md
    └── plugin-extensions.md
```

## Implementation Strategy

1. **Parallel Development**: Can work on different docs simultaneously
2. **Community Input**: Gather feedback from current contributors
3. **Living Documentation**: Keep docs updated with code changes
4. **Examples First**: Start with practical examples developers need

## Files to Create

```
CREATE: CONTRIBUTING.md
CREATE: docs/architecture.md
CREATE: docs/testing.md
CREATE: docs/code-standards.md
CREATE: docs/troubleshooting.md
CREATE: docs/plugin-api.md
CREATE: docs/performance.md
CREATE: docs/examples/ (multiple files)
UPDATE: README.md (enhance existing)
```

## Success Metrics

1. **Developer Onboarding**: Time to first contribution
2. **Issue Reduction**: Fewer questions about setup/development
3. **Code Quality**: More consistent contributions
4. **Community Growth**: Easier for external contributors to participate