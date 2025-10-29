# Tokens Studio for Figma

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.10.2-brightgreen.svg)](https://github.com/tokens-studio/figma-plugin/releases)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Tokens Studio for Figma is a powerful plugin for Figma that enables you to define, manage, and use design tokens directly within your design workflow. Store your design tokens in JSON format, sync them with providers like GitHub, GitLab, or Azure DevOps, and define tokens for properties that don't have native Figma support yet, such as border radius, spacing, and more.

## Key Features

- **Design Token Management**: Define and manage color, typography, spacing, border radius, and more as reusable tokens
- **Multi-Provider Sync**: Sync tokens with GitHub, GitLab, Azure DevOps, JSONBin, and other storage providers
- **Alias Support**: Create token aliases to build scalable design systems with semantic naming
- **Auto Layout Integration**: Apply spacing tokens to automatically configure Auto Layout properties
- **Theme Management**: Manage multiple themes and token sets efficiently
- **Figma Variables**: Integration with Figma's native Variables API

Think of it as Styles for everything in Figma.

## Documentation

For everything ranging from a quick start guide, to step by step instructions on how to keep your styles in sync (amongst other more complex use cases), you can visit our [main documentation site](https://docs.tokens.studio/).

## Roadmap

Head over to [our roadmap](https://github.com/orgs/tokens-studio/projects/34/views/6) for insights into how we're tackling issues or adding improvements to the product.

## Translations

Looking to contribute a translation for your language? See instructions [here](./developer-knowledgebase/translations.md).

## Slack Channel

There's a Slack channel where the community can exchange ideas, best practices or simply ask a question. Join us [here](https://tokens.studio/slack)!

## How should I use this plugin?

There's 2 ways how you could use the plugin:

- Only use it to create or update your Styles but not apply any tokens with it, which would allow you to use features such as atomic type decisions, aliases and theme sets for managing styles (this is really powerful in combination with Figma's Swap library feature).
- Use it to apply tokens with it, which would give you style-like functionality for things like border radius or spacings.

It's up to you what method you choose. If you choose the option to keep using Styles then the plugin will only serve as a method to update them, but you would still be using Figma Styles for apply color and text styles.

## How does applying border radius or spacing tokens work?

Whenever you apply a token to a layer, the plugin will store hidden information on that layer containing information about what token to apply for what property. Whenever your tokens change, we scan the document for any layers containing these hidden information, and update layers accordingly. For Styles, the plugin checks if there is any local style with the same name of your color or typography tokens and updates these. For files where the local styles is remote (not local to that document) the plugin has no way to apply the style currently and will apply the raw hex value. I would advise to apply styles with Figma's Style feature, not with the plugin due to exactly this reason. The plugin can still serve as a manager for styles then, allowing you to use a single source of truth.

## Additional information

Most information can be found in the [docs](https://docs.tokens.studio) or our [website](https://tokens.studio).

## How to Contribute

This is a monorepo managed with [Turbo](https://turbo.build/) and [Yarn workspaces](https://yarnpkg.com/features/workspaces). The main Figma plugin is located in `packages/tokens-studio-for-figma/`.

### Development Setup

1. **Install dependencies**:

   ```bash
   yarn --frozen-lockfile --immutable
   ```

2. **Start development mode**:

   ```bash
   yarn start
   ```

   This starts webpack in watch mode for all packages.

3. **Load the plugin in Figma**:

   - Open Figma Desktop
   - Go to `Plugins` → `Development` → `Import plugin from manifest...`
   - Select the `manifest.json` file from `packages/tokens-studio-for-figma/`

4. **Build for production**:
   ```bash
   yarn build
   ```

### Testing

- **Unit tests**: `yarn test` (uses Jest)
- **Watch mode**: `yarn test:watch`
- **E2E tests**: `yarn cy:open` (uses Cypress)
- **Run E2E headless**: `yarn cy:run`

### Linting and Formatting

- **Lint with auto-fix**: `yarn lint`
- **Format code**: `yarn format`

### Creating a Pull Request

1. Create a feature branch from `main`
2. Make your changes following the existing code patterns
3. **Required**: Run `yarn changeset` and create a changeset describing your changes
4. Ensure tests pass and code is linted
5. Create a pull request using the provided template

For more detailed information, see the [developer knowledgebase](./developer-knowledgebase/).

## Known Issues

This is not an exhaustive list, please reach out to us in the [Tokens Studio Slack](https://tokens.studio/slack) for further help.

### Cannot read property document of undefined

This error can be solved by clearing Figma's cache. Follow the steps outlined in [this document](https://help.figma.com/hc/en-us/articles/360040328553-Can-I-work-offline-with-Figma-#clear-data).

#### Mac

Use the Terminal app to clear the cache.

1. Quit the Figma desktop app
2. Open the Terminal.app and enter the following command: `rm -rf "$HOME/Library/Application Support/Figma/"{Desktop,DesktopProfile}`
3. Try opening the Figma desktop app again
