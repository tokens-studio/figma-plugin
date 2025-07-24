# Tokens Studio for Figma - Development Guidelines

## Repository Overview

Tokens Studio for Figma is a plugin for Figma allowing you to define and use design tokens. The repository is a monorepo managed with Yarn workspaces:

- `packages/tokens-studio-for-figma` - Main Figma plugin package
- `developer-knowledgebase` - Technical documentation

### Figma Plugin Architecture

As a Figma plugin, our codebase is split into two main environments:

- **UI (iframe)**: The React-based user interface that runs in a browser-like environment
- **Figma Sandbox**: The code that interacts directly with the Figma document and API

Figma plugins operate on a message-passing architecture between these two environments. The UI sends messages to the sandbox to request operations on the Figma document, and the sandbox responds with results or events.

For anything related to the Figma sandbox environment or using the global `figma` object, always consult the official Figma Plugin API documentation at https://www.figma.com/plugin-docs/. This documentation is essential for understanding the capabilities and limitations when working with Figma's API.

## Development Setup

### Prerequisites

- Node.js 18.x
- Yarn 1.22.x

### Getting Started

1. Install dependencies: `yarn --frozen-lockfile --immutable`
2. Start development: `yarn start` (watches for changes)
3. Build for production: `yarn build`

## Build System

### Core Build Commands

- `yarn build` - Production build
- `yarn build:dev` - Development build
- `yarn build:preview` - Build for browser preview
- `yarn build:cy` - Build with feature flags for Cypress tests
- `yarn start` - Development build with watch mode

### Webpack Configuration

The project uses Webpack with the following key configurations:

- SWC for fast transpilation
- Different entry points for UI and plugin code
- Source maps in development mode
- Environment variables loaded via dotenv-webpack

## Testing

### Unit Tests

- Jest is used as the test framework
- Run tests: `yarn test`
- Run in watch mode: `yarn test:watch`
- With coverage: `yarn test:coverage`

### End-to-end Tests

- Cypress is used for E2E testing
- Start Cypress UI: `yarn cy:open`
- Run headless: `yarn cy:run`
- Serves on localhost:58630

### Performance Testing

- Benchmarking tools available: `yarn benchmark:build` and `yarn benchmark:run`

## Code Style

### Linting & Formatting

- ESLint with Airbnb config: `yarn lint` (auto-fixes issues)
- Without auto-fix: `yarn lint:nofix`
- Prettier: `yarn prettier:format`
- Pre-commit hooks using Husky and lint-staged

### TypeScript

- TypeScript is used throughout the codebase
- Check the tsconfig.json for configuration
- Jest uses ts-jest for TypeScript support

## Architecture

### Plugin Structure

- `src/app` - React UI components
- `src/plugin` - Figma plugin code
- `src/storage` - Storage providers for tokens
- `src/types` - TypeScript type definitions

### State Management

- Redux with Rematch for state management
- React hooks for component state

### Key Technologies

- React 18
- Redux/Rematch
- TypeScript
- SWC for transpilation
- Monaco editor for JSON editing
- Radix UI components

## Environment Configuration

Required environment variables in `.env` files:

```
MIXPANEL_ACCESS_TOKEN=
STORYBLOK_ACCESS_TOKEN=
ENVIRONMENT=development
LICENSE_API_URL=https://licence.tokens.studio
LAUNCHDARKLY_SDK_CLIENT=626fb05d52e5c715abd11b5e
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_SAMPLING=0.1
SENTRY_PROFILE_SAMPLING=0.1
SENTRY_REPLAY_SAMPLING=0
```

## Translation System

- Translation files in `src/i18n/lang/[language]`
- Supports: English, Spanish, French, Hindi, Dutch, Chinese
- Add translations with `yarn translate`
- Uses i18next for internationalization

## API Integrations

- GitHub, GitLab, BitBucket, Azure DevOps - For token storage/sync
- Sentry - Error tracking
- Mixpanel - Analytics
- LaunchDarkly - Feature flags

## Common Workflows

## Debugging

- Use console.log in plugin code (visible in Figma's developer console)
- React dev tools for UI debugging
- Performance benchmarking with `yarn benchmark:run`

## Common Issues & Solutions

- "Cannot read property document of undefined" - Clear Figma cache
- Build failures - Check your Node version and dependencies
- Test failures - Check for environment variables and mocks

## Changeset Requirements

**IMPORTANT: Every PR must include a changeset to describe the changes made.**

Before making any code changes or when completing a PR:

1. **Always run `yarn changeset` to create a changeset file**
2. Choose the appropriate version bump (patch, minor, major) based on the changes
3. Write a clear, user-facing description of what changed
4. Commit the generated changeset file along with your changes

This is mandatory for all code changes and helps maintain proper version management and release notes.

## Code Patterns to Follow

1. Use functional React components with hooks
2. Strongly type all props and state
3. Follow the existing component structure
4. Keep components small and focused
5. Use appropriate error handling
6. Document complex logic with comments
7. **Always create a changeset (see Changeset Requirements section above)**
8. For UI components, use @tokens-studio/ui components that we use across the codebase instead of creating from scratch
9. For UI work, use tokens from @tokens-studio/tokens, found in node_modules/@tokens-studio/tokens/dist/css/dark.css and node_modules/@tokens-studio/tokens/dist/css/core.css instead of using raw hex values.
