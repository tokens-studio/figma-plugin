# Figma Tokens

![installs](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/installs.json)
![likes](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/likes.json)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

Figma Tokens is a Figma plugin allowing you to define and use design tokens in Figma. It allows you to set and create color or typography styles in a granular way by extracting atomic decisions to tokens. Also, it allows you to define reusable values for spacing which you can apply on Auto Layout layers, or set border radious tokens on rectangles that update whenever your tokens change. Think of it like Styles for everything.

# Documentation
https://docs.tokens.studio/

# How does it work?
Whenever you apply a token to a layer, the plugin will store hidden information on that layer containing information about what token to apply for what property. Whenever your tokens change, we scan the document for any layers containing these hidden information, and update layers accordingly. For Styles, the plugin checks if there is any local style with the same name of your color or typography tokens and updates these.

# More information
I will provide more information and some Getting Started videos on my personal website: [jansix.at/resources/figma-tokens](https://jansix.at/resources/figma-tokens)

# Contribute
* Run `yarn` to install dependencies.
* Run `yarn build:watch` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose `manifest.json` file from this repo.
* Create a Pull Request for your branch
