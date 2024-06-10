# Tokens Studio for Figma (formerly known as Figma Tokens)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Tokens Studio for Figma is a plugin for Figma allowing you to define and use design tokens in Figma. You can store your design tokens in JSON, sync them with a sync provider such as GitHub and define tokens even for properties that have no native support yet in Figma, such as borderRadius or spacing. You can create color and typography tokens in a granular way by extracting atomic decisions to tokens. You can also define aliases for every token, so that you can reuse your decisions. You can define and apply spacing tokens, allowing you to set the Auto Layout properties in Figma automatically. Think of it like Styles for everything.

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

## How to contribute

1. Run `yarn  --frozen-lockfile  --immutable` to install dependencies.
2. Run `yarn start` to start webpack in watch mode or `yarn build` to build once.
3. Open `Figma` -> `Plugins` -> `Development` -> `Import plugin from manifest...` and select the `manifest.json` file from the relevant package.
4. Create a pull request for your branch, including as much information as possible within the provided template.

## Known Issues

This is not an exhaustive list, please reach out to us in the [Tokens Studio Slack](https://tokens.studio/slack) for further help.

### Cannot read property document of undefined

This error can be solved by clearing Figma's cache. Follow the steps outlined in [this document](https://help.figma.com/hc/en-us/articles/360040328553-Can-I-work-offline-with-Figma-#clear-data).

#### Mac

Use the Terminal app to clear the cache.

1. Quit the Figma desktop app
2. Open the Terminal.app and enter the following command: `rm -rf "$HOME/Library/Application Support/Figma/"{Desktop,DesktopProfile}`
3. Try opening the Figma desktop app again
