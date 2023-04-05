# Tokens Studio for Figma (formerly known as Figma Tokens)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Tokens Studio for Figma is a plugin for Figma allowing you to define and use design tokens in Figma. You can store your design tokens in JSON, sync them with a sync provider such as GitHub and define tokens even for properties that have no native support yet in Figma, such as borderRadius or spacing. You can create color and typography tokens in a granular way by extracting atomic decisions to tokens. You can also define aliases for every token, so that you can reuse your decisions. You can define and apply spacing tokens, allowing you to set the Auto Layout properties in Figma automatically. Think of it like Styles for everything.

# Documentation
https://docs.tokens.studio/

# Roadmap
https://github.com/orgs/tokens-studio/projects/34/views/6

# Slack Channel
There's a Slack channel where the community can exchange ideas, best practices or simply ask a question. [Want to join](https://tokens.studio/slack).

# Sponsors
| <a href="https://zed.dev/" target="_blank" style="display: block; text-align: center;"><img src="sponsors/zed_logo.png" style="display: block; width: 75px; height: auto; margin-bottom: 4px" alt="Zed Logo"/></a> | <a href="https://mirahi.io/?ref=six7-sponsorship" target="_blank"><img src="sponsors/mirahi_logo_dark.svg" style="display: block; width: 75px; height: auto; margin-bottom: 4px" alt="Mirahi Logo"/></a> |
| --- | --- |
| <a href="https://zed.dev/" target="_blank" style="display: block; text-align: center;">zed.dev</a> | <a href="https://mirahi.io/?ref=six7-sponsorship" target="_blank" style="display: block; text-align: center;">Mirahi</a> |

Is your company using Tokens Studio for Figma? Consider subscribing to Pro to benefit from advanced features and support the project! More info on [our website.](https://tokens.studio)

# How should I use this plugin?
There's 2 ways how you could use the plugin: Only use it to create or update your Styles but not apply any tokens with it, which would allow you to use features such as atomic type decisions, aliases and theme sets for managing styles (this is really powerful in combination with Figma's Swap library feature). Or you could use the plugin to apply tokens with it, which would give you style-like functionality for things like border radius or spacings.

It's up to you what method you choose. If you choose the option to keep using Styles then the plugin will only serve as a method to update them, but you would still be using Figma Styles for apply color and text styles.

# How does applying border radius or spacing tokens work?
Whenever you apply a token to a layer, the plugin will store hidden information on that layer containing information about what token to apply for what property. Whenever your tokens change, we scan the document for any layers containing these hidden information, and update layers accordingly. For Styles, the plugin checks if there is any local style with the same name of your color or typography tokens and updates these. For files where the local styles is remote (not local to that document) the plugin has no way to apply the style currently and will apply the raw hex value. I would advise to apply styles with Figma's Style feature, not with the plugin due to exactly this reason. The plugin can still serve as a manager for styles then, allowing you to use a single source of truth.

# More information
Most information can be found in the [docs](https://docs.tokens.studio) or [our website](https://tokens.studio).

# Contribute
* Run `npm ci` to install dependencies.
* Run `npm run start` to start webpack in watch mode or `npm run build` to build once.
* Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose `manifest.json` file from this repo.
* Create a Pull request for your branch

### Known Issues

#### Cannot read property document of undefined

This error can be solved by clearing Figma's cache; follow the steps outlined in [this document](https://help.figma.com/hc/en-us/articles/360040328553-Can-I-work-offline-with-Figma-#clear-data).

```
Mac
Use the Terminal app to clear the cache.

Quit the Figma desktop app.
Open the Terminal.app and enter the following command: rm -rf "$HOME/Library/Application Support/Figma/"{Desktop,DesktopProfile}
Try opening the Figma desktop app again.
```
