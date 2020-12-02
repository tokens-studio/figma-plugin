# Figma Tokens

![installs](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/installs.json)
![likes](https://img.shields.io/endpoint?url=https://yuanqing.github.io/figma-plugins-stats/plugin/843461159747178978/likes.json)

<a href="https://www.producthunt.com/posts/figma-design-tokens?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-figma-design-tokens" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=217712&theme=light" alt="Figma Design Tokens - Making design tokens a single source of truth for Figma. | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>

# How to use

## Get started
When you first open the plugin we give you a set of pre-defined tokens that can be used as-is to show you what is possible. You can delete these tokens by going to the `JSON` tab and hitting the `Clear` button to remove all tokens.

## Creating Tokens
Create new tokens by hitting the `+` button in the token group that you wish to add a token.

## Creating a new Token Group
if you want to nest your tokens you can do that. Go to the Edit Tokens dialog o the property you want to create a group for and then hit the `Add a new group` button.

## Applying Tokens
There are two ways how you can apply tokens to your selection:

### Default behaviour (left-click)
When you left-click a token this token is being put on your selection (multiple layers selected are possible!). For certain tokens we assume defaults, such as for `Colors` we assume you want to apply `Fill`.

### Specifying what to apply (right-click)
You can right-click tokens to specify what property should be set, such as in `Spacing` the `Horizontal Spacing`, `Vertical Spacing` or `Gap` properties individually




# Contribute
* Run `yarn` to install dependencies.
* Run `yarn build:watch` to start webpack in watch mode.
* Open `Figma` -> `Plugins` -> `Development` -> `New Plugin...` and choose `manifest.json` file from this repo.
* Create a Pull Request for your branch
