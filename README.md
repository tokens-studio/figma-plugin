# Figma Tokens

![installs](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/installs.json)
![likes](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/likes.json)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Figma Tokens is a Figma plugin allowing you to define and use design tokens in Figma. It allows you to set and create color or typography styles in a granular way by extracting atomic decisions to tokens. Also, it allows you to define reusable values for spacing which you can apply on Auto Layout layers, or set border radious tokens on rectangles that update whenever your tokens change. Think of it like Styles for everything.

# Documentation
https://docs.tokens.studio/

# Roadmap
https://github.com/users/six7/projects/4/views/4

# Slack Channel
I'm currently setting up a Figma Tokens Slack channel so the community can exchange ideas, best practices or simply ask a question. Want to join? Let me know by sending me a [DM on twitter](https://www.twitter.com/six7) and I'll send you the invite.

# How should I use this plugin?
There's 2 ways how you could use the plugin: Only use it to create or update your Styles but not apply any tokens with it, which would allow you to use features such as atomic type decisions, aliases and theme sets for managing styles (this is really powerful in combination with Figma's Swap library feature). Or you could use the plugin to apply tokens with it, which would give you style-like functionality for things like border radius or spacings.

It's up to you what method you choose. If you choose the option to keep using Styles then the plugin will only serve as a method to update them, but you would still be using Figma Styles for apply color and text styles.

# How does applying border radius or spacing tokens work?
Whenever you apply a token to a layer, the plugin will store hidden information on that layer containing information about what token to apply for what property. Whenever your tokens change, we scan the document for any layers containing these hidden information, and update layers accordingly. For Styles, the plugin checks if there is any local style with the same name of your color or typography tokens and updates these. For files where the local styles is remote (not local to that document) the plugin has no way to apply the style currently and will apply the raw hex value. I would advise to apply styles with Figma's Style feature, not with the plugin due to exactly this reason. The plugin can still serve as a manager for styles then, allowing you to use a single source of truth.

# More information
Most information can be found in the docs, but you can also go to my personal website to find some more details about my work. [jansix.at/resources/figma-tokens](https://jansix.at/resources/figma-tokens)

# Contribute
* Run `yarn` to install dependencies.
* Run `yarn build:watch` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose `manifest.json` file from this repo.
* Create a Pull Request for your branch
