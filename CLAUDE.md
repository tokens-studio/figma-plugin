# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a monorepo using Turbo and Yarn workspaces. The main Figma plugin is in `packages/tokens-studio-for-figma/`.

### Common Commands
- `yarn --frozen-lockfile --immutable` - Install dependencies
- `yarn build` - Build all packages 
- `yarn start` - Start development mode (runs Vite in watch mode)
- `yarn lint` - Run ESLint across all packages
- `yarn test` - Run Jest tests across all packages
- `yarn test:watch` - Run tests in watch mode

### Plugin-Specific Commands (run from `packages/tokens-studio-for-figma/`)
- `yarn build` - Production build with Vite
- `yarn build:dev` - Development build
- `yarn start` - Start Vite in development watch mode
- `yarn test` - Run Jest tests with feature flags enabled
- `yarn test:watch` - Run tests in watch mode without coverage
- `yarn test:coverage` - Run tests with coverage reporting
- `yarn cy:open` - Open Cypress for E2E testing
- `yarn cy:run` - Run Cypress tests headlessly
- `yarn lint` - Run ESLint with auto-fix
- `yarn lint:nofix` - Run ESLint without auto-fix
- `yarn storybook` - Start Storybook for component development

### Testing
- Jest configuration is in `packages/tokens-studio-for-figma/jest.config.ts`
- Test files follow `.test.ts` or `.test.tsx` naming
- E2E tests use Cypress and are in `packages/tokens-studio-for-figma/cypress/`
- Feature flags are enabled during testing via `LAUNCHDARKLY_FLAGS` environment variable

## Architecture Overview

### Monorepo Structure
- Root-level package.json manages the monorepo with Turbo
- `packages/tokens-studio-for-figma/` contains the main Figma plugin
- Developer documentation is in `developer-knowledgebase/`

### Plugin Architecture
The Figma plugin follows a dual-thread architecture:

1. **Main Thread (Plugin Controller)**: `src/plugin/controller.ts`
   - Handles Figma API interactions
   - Manages async message handlers
   - Controls plugin lifecycle

2. **UI Thread (React App)**: `src/app/index.tsx`
   - React application using Redux for state management
   - Uses Stitches for CSS-in-JS styling
   - Rematch for Redux store configuration

### Key Directories
- `src/plugin/` - Plugin-side code that runs in Figma's plugin environment
- `src/app/` - UI React application code
- `src/storage/` - Token storage providers (GitHub, GitLab, Azure DevOps, etc.)
- `src/selectors/` - Redux selectors for state management
- `src/utils/` - Shared utility functions
- `src/types/` - TypeScript type definitions
- `src/constants/` - Application constants and enums
- `src/figmaStorage/` - Figma plugin data storage management

### Communication Pattern
The plugin uses an AsyncMessageChannel pattern for communication between the main plugin thread and UI thread. Message handlers are defined in `src/plugin/controller.ts` and types in `src/types/AsyncMessages.ts`.

### State Management
- Uses Redux with Rematch for state management
- Store configuration in `src/app/store.ts` 
- Selectors are organized by domain in `src/selectors/`
- State is persisted to Figma's plugin storage via `src/figmaStorage/`

### Token Processing
- Token resolution handled by `src/utils/TokenResolver.ts`
- Support for multiple token formats and transformations
- Variable creation and management for Figma Variables API

### Storage Providers
Multiple storage providers are supported for token synchronization:
- GitHub (`src/storage/GithubTokenStorage.ts`)
- GitLab (`src/storage/GitlabTokenStorage.ts`)
- Azure DevOps (`src/storage/ADOTokenStorage.ts`)
- JSONBin (`src/storage/JSONBinTokenStorage.ts`)
- Local file storage and more

### Build System
- Webpack configuration in root and plugin-specific configs
- Supports development, production, and preview builds
- Bundle analysis and benchmarking tools available
- Uses SWC for fast TypeScript compilation

## Code Standards

### Formatting and Linting
- **Always run formatting tools** after making code changes:
  - `yarn lint` - Run ESLint with auto-fix across all packages
  - `npx prettier --write <file>` - Format specific files
  - `npx eslint <file> --fix` - Fix ESLint issues in specific files
- **Code style**: Follow existing patterns with 2-space indentation, single quotes, trailing commas
- **Console statements**: console.log is acceptable for debugging (widely used in codebase)
- **Before committing**: Ensure code passes linting checks

### Best Practices
- Follow existing component and utility patterns
- Use TypeScript types consistently
- Implement proper error handling with try/catch blocks
- Use async/await patterns with `defaultWorker.schedule()` for operations that need progress tracking

## Important Notes

- The plugin requires specific Figma API permissions defined in `manifest.json`
- Feature flags are managed via LaunchDarkly integration
- Internationalization support with i18next
- Comprehensive test coverage with both unit and E2E tests
- Uses Figma Plugin DS for consistent UI components