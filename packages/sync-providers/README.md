# Sync Providers

This package aims to be a self-contained group of methods that allow interacting with a variety of supported remote storage solutions.

## The Present

- A new package now exists within the monorepo: `packages/sync-providers/*`
- Started moving methods and dependencies of a single provider into it (GitHub is #1 = the most popular one!):
   - Listed by popularity as outlined in the original ticket: https://github.com/tokens-studio/figma-plugin/issues/3000#issue-2411345591
- Replaced constants and methods in `packages/tokens-studio-for-figma/*`, and deleted the duplicates if necessary
   - `@sync-providers/*` is the alias currently used

## The Future

### Stage 1: extracting and replacing

Continuing the initial simple trend of "moving and replacing", there can be tasks split up by provider. In order of popularity as it stands at the time of writing (3 Sep 2024):
1. GitHub (in progress in the `feat/3000-extract-sync-providers` branch)
2. GitLab
3. Azure DevOps
4. URL
5. JSONBIN
6. Supernova
7. Generic Versioned Storage
8. Bitbucket
9. Tokens Studio

_Most_ of the core logic of interacting with these lives in `remoteTokens.tsx`, the aim of moving over each provider should be to replace the main hooks (i.e. `useGitHub()`) containing all the helper methods into the `@sync-providers` realm, and make the plugin use them from there.

### Stage 2: abstracting and refactoring

Once all the providers are moved into its own sibling 'package' `@sync-providers`, it should become easier to remove superflous methods and abstract the concept of third party remote providers easy to add or remove for users wishing to take advantage of the new package.

Below are a list of dependencies that are `figma-plugin` specific and should be removed from the new package and prevent bloating it with types and interfaces. Meaning that interacting with providers will be agnostic to an environment, and just returns data once an action is completed:
- Dialogs and collecting user's decisions (`usePullDialog`, `usePushDialog`, `useConfirm`)
- Figma notifications (`notifyUI`)
- Global Redux state (`dispatch.*`)
- AsyncMessageChannel (`AsyncMessageChannel`)

### Stage 3: standalone published package

Moving the folder into an outside repository entirely, with its own pipeline that ensures the relevant actions take place. Planning a robust external API, at least for v1 will be necessary. For example: pushing & pulling tokens, as a starting point.

## Miscellaneous leftover tasks
- Extract types and interfaces that are contained within components / classes into their own files
- Group types and interfaces into bigger files
- Improve folder structure, with the thought of it being a reusable published package
- Remove dependencies that directly update the plugin state (i.e. `dispatch.*`) by passing a callback that solely grabs the data necessary from those methods, and ensures the plugin knows
- Include existing unit tests and command to run these
- Setup ESLint correctly
- Setup TS correctly
