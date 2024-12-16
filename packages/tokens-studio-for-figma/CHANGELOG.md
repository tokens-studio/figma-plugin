# @tokens-studio/figma-plugin

## 2.2.3

### Patch Changes

- 01ccff2a: Fixes an issue when updating a token's value from a reference to a hard value, the check we introduced in the last release caused those to not be updated (and only worked when changing to another reference).

## 2.2.2

### Patch Changes

- 23caccde: Fixes sync with Bitbucket provider:

  - Pull when the option is to sync with a single file was not working
  - Push was removing all other .json files in the selected folder (either root of the chosen folder)

## 2.2.1

### Patch Changes

- 1af628f1: fixed an issue with pulling token sets from Bitbucket when multi-file sync is enabled, wherein all the token sets were not being pulled.
- fdfc7be2: Disable cache for Bitbucket
- 04f3fa67: When updating variables we now properly check if the variable needs to be updated, which fixes an issue where Figma was showing library updates even though the values were the same

## 2.2.0

### Minor Changes

- da1886da: Re-introduces "Update styles". If enabled, the plugin will update any local styles when token values or themes change. By default, this setting is off. It's available from the gear menu in the bottom right

### Patch Changes

- 80a5a92b: Fixed an issue where sometimes duplicate sync providers would show up
- 4fd3f9b1: fix(tokenState): setTokensFromVariables description comparison
- 7be0b29d: Fixed an issue where referencing a gradient would result in an empty color style; now the style correctly resolves to the gradient.
- a6eb07de: fixes a bug where applying a typography token to a text node would override individual property changes (like font size or font family) when "Apply to selection/page/document" is clicked.

## 2.1.1

### Patch Changes

- f6398c7a: Fixed an issue introduced in 2.1.0 that sometimes caused the order of token sets to not be as expected, meaning sets that acted as overrides didn't correctly get calculated.
- fe94d6a3: Resolved an issue with Bitbucket sync where deleted sets were still being reflected in the tokens repository.
- bf8c185a: Fixed a bug where applying themes using "Prefix styles with active theme name" didn't correctly apply the right styles.
- cddfb5ba: Fixed an issue with "zombie variables". Basically, even though a Figma file shows 0 variables, Figma's plugin API will sometimes tell us there's variables existing - probably ones that existed in the past but should be deleted - Figma seems to report those as existing still. This led to issues around applying and referencing variables where we'd point to those zombies. We now correctly check if the variable's collection still exist, and only then use those as references.

## 2.1.0

### Minor Changes

- 0bc599e0: Changed logic around how we create styles or variables around Theming, as well as the logic around token sets and themes. 2.0 introduced some changes that made the whole process more strict. This change now changes things the other way around, we're less strict. Basically, if you export themes and you are exporting multiple themes at once, we now look at the overall configuration of token sets and pass these on as tokens to use for resolution. Meaning, you should not run into issues where you have broken references anymore just because a token set was disabled. If a set contains a token - even if the set is disabled - we will use it to resolve references.
- e1838a32: Fixes issue where styles are not applied in Figma, when user exports Token Sets as Styles

### Patch Changes

- 417df53c: Raise limit for tokens in Tokens Studio sync to 3000 tokens per set
- 087b4c1e: Fixed an issue around variable creation where if numerical weights were used we'd display an error that we're unable to apply the font. We now changed this to properly load all weights of the font family and then create styles correctly with variable references to the numerical weight variable
- 2c60963c: Changed logic when "Remove styles and variables without connection to a token" is enabled where we now look at all created tokens in this session and remove them, instead of looking at each theme individually
- a81b9a9f: Add missing padding to list of token sets in Export Token Sets Tab
- fd68d5a5: Prevents falsy errors from displaying when pushing to GitLab and ADO
- 087b4c1e: Fixes variable creation of color token was using a modifier and using a reference. We now correctly create a raw hex value as Figma doesn't have modifiers. Before we falsely used a reference without the modifier applied
- 8f97ea63: Optimized the speed of importing variables. Importing should now feel drastically faster

## 2.0.3

### Patch Changes

- 9f8c0360: Fixes an issue where applied styles are not displaying in Figma, when the themes have been exported as non-prefixed styles from the plugin.

  Fixes the issue where applied styles are not displaying in Figma, when the themes have been exported with both 'prefix styles with active theme name' and 'ignore first part of token name for styles' options have been checked

## 2.0.2

### Patch Changes

- 1784f101: Fixes issues when synchronizing data with GitLab, which prevented creating new branches on the fly and switching between single and multi-file setups.
- 2dc668cc: Fixes the issue where only active themes were being exported as styles, even when multiple themes were selected in the options modal.

  Fixes the problem where applied styles were not being displayed in figma when the core/global theme was being activated.

- 22018a93: Fix a visual bug in the Resolve Duplicate Tokens modal

## 2.0.1

### Patch Changes

- 27d40280: Fixed several issues related to Azure DevOps related to pushing and creating branches other than the default one as well as switching between single file and multi file.
- dcb41eb1: Fixed an issue with Bitbucket sync that caused sets that are in folders to not be pulled correctly
- 3405929e: Fixed an issue with UI appearing broken, related to the debug session recording feature

## 2.0.0

### Major Changes

- 9c409b487: We now support the W3C Design Tokens Community Group format! The plugin offers a way to convert your tokens to the new format for remote as well as locally stored tokens. We also auto-detect if you're using the new format in your token files, and will use that format.

### Patch Changes

- 7ff4131a9: You can now use `rem` units in letter spacing tokens
- 61673a6d1: Fixes an issue where duplicating a token to another set incorrectly displayed an error message about token names needing to be unique.
- 9ce1434a3: Opacity tokens are now being created properly in Figma and are being applied as variables when available
- 7ffc30f7e: You can now set max width and height tokens on component instances (not on their children)
- 7181b1870: Prevent token names from containing { or } or starting with $
- 467569b42: Fixes an issue that caused going from URL storage to Local storage to be in read-only until plugin restart
- 890c5b204: Non-local variables: You can now create variables that reference variables from other files, as long as you're using Themes and your variables are attached to tokens.
- 171823b7b: Fixed an issue that caused updating tokens that contained a modified reference to update multiple modes at once, instead of just the affected one.
- cdb570853: Using Select all in Inspect view when you were using a filtered view is now correctly only removing tokens that were selected, instead of all.
- 325d7d2d9: Color styles now contain a color variable as a value if the value is a pure reference to another token and that token is attached to a variable via Themes
- ffe0d6cc5: Allow users to export variables based on selected sets and export options
- 7ff4131a9: You can now use negative % values in line height tokens
- 3728cc19c: Allow users to create variables from selected sets when not using themes
- 81d2306bd: Provide ability to users to add nested levels to a token
- 4989732a7: You can now choose if you want variables and styles applied when you're updating your layers. This allows you to effectively make use of the plugin's theme switching even though you've created variables.
- a2f4479bd: Feature: You can now resize the left sidebar
- 75260aead: Added support for variables in typography styles
- 230842255: Fixed an issue with the plugins error boundary, error messages should now show up in the UI again
- bdddf04df: Typography tokens such as line heights, font sizes, paragrap spacing, paragraph indent and letter spacing now take number and dimension tokens as suggested tokens
- 483c52622: When you apply a token to a layer, and that token isnt connected to a variable, we will now try to apply the token's reference as a variable. This enables you to apply component tokens and have their semantic variable applied as long as it's a pure reference and that component token has no variable connected.
- cb230b001: Selecting something when typing { will now no longer insert a space after
- 0cb557937: Fixed an issue where variable references weren't using references from the current theme but from another theme that was using the same token names. If you are creating multiple collections with the same token structure, it's recommended to create them one by one to avoid reference clashes. For the default scenario of where different theme groups don't share the same tokens (recommended), you can create all themes at once.
- e83024a34: Options (use rem, convert numbers to dimensions) are now disabled by default for the Import variables dialog
- a66f76153: When editing a border token and switching from reference to input mode we now populate the contents.
- 467569b42: Fix: Token suggestions now ignore case, meaning you don't have to type Blue to find a token called blue
- 49cbdf397: Fixed an issue with 0px borders showing up as 0.001px in Figma's DevMode
- d4cd4de73: The internal 'id' property is now properly stored on the 'studio.tokens' key in the '$extensions' object of a token
- 166b487c3: After creating a new token set we now switch to this new set
- 83712ce40: Fixed an issue where cmd+clicking a token allowed you to edit even without edit rights
- 19a43d98a: Opacity tokens are now being created as number variables when exported to Figma
- 19242fdb5: Added regex support to bulk remap
- 870b0bc10: Allow users to create styles together when creating variables
- 8cfda9370: Adds support for binding variables to stroke weight and opacity
- 13b8a96da: Added BitBucket as a provider in Beta
- e25ddc391: Allow to create variables based on selected themes

## 1.38.9

### Patch Changes

- ff11c7c2: Support Supernova new app URL

## 1.38.8

### Patch Changes

- 70313100: Fixes an issue with the Mix color modifier ignoring colorspace options
- e2e85625: Allow numbers and dimensions to be used in x and y node properties
- 1424c9f8: Fix the renaming tokens in the other type breaks references
- c306ddf2: Feat/import variables
- 4f54a33d: Fixed an issue where stroke styles on node where not shown in Inspect.

## 1.38.7

### Patch Changes

- 3c9c1944: Inspect now also properly shows stroke variables that were applied
- 55c8c224: Add rotation property to number & dimension tokens
- b3b02db5: Fixes an issue that caused the plugin to not remove tokens when multiple layers were selected and you tried to remove tokens.
- d44d993b: Fix un-usual remapping renaming behaviour
- 30bf0e6b: Add horizontalPadding and verticalPadding as options for Spacing

## 1.38.6

### Patch Changes

- 77117e77: Fixes an issue with extension data changes that would mutate data
- e08fc62a: Revert "feat: ignore first part of token name for variables"
- 3c6b4615: Fixed an issue which shows number value in case a text which its value is 003e78 and 000000

## 1.38.5

### Minor Changes

- 28cd5d74: Allow skipping first part of token name when creating variables, similarly to how it has worked for styles

### Patch Changes

- caebd05d: Skip multi value tokens when creating variables
- e8ad7c48: Fixed an issue that caused some tokens to falsely appear as broken
- 4d63ce61: Reordered the typography composite token fields to have lineHeight follow fontSize
- c9e2a9b4: Fixed an issue that caused color modifiers values to be ignored when creating or updating variables

## 1.38.4

### Patch Changes

- 6015f46f: Fixed an issue with Update on change. It's now working again, but disabled for new users as intended.

## 1.38.3

### Patch Changes

- 23ff7080: Fixes an issue that causes a crash when interacting with a numeric token, such as duplicating

## 1.38.2

### Patch Changes

- 1e5beacb: We now carry over token descriptions when creating variables
- abf1cb0b: Fixed an issue that caused the active theme to be reset when you were editing it in Manage themes
- 20189a39: Changing a token group's name now lets you also rename attached styles and variables
- e5de5250: Reintroduces support for nested references for 1 level deep (use at your own risk, this affects performance). For example, you can use `{colors.{primary}.500}` but not `{colors.{brand.{primary}}}`.
- 02ac59b5: We now show token values in the inspect tab using tooltips to preview the value
- 572840bd: Fixed a bug where expired license keys could not be removed

## 1.38.1

### Patch Changes

- a4f87c0d: Fixes an issue with suggestions showing up in light theme
- c39ed48b: Fixes a bug that caused raw value documentation tokens to stop working
- c9aa3687: Fixes an issue where min width tokens would stop tokens from being applied if part of an instance
- 0247885c: Fixed a bug that caused themes to be unset after branch switch and reopen of plugin
- 6135aed7: Changes quick-edit shortcut on Windows to ctrl+click
- 76ae4b95: Fixed some of the onboarding links pointing to a 404

## 1.38.0

### Minor Changes

- cbfc5cd7: Added an 'id' field to internal token usage containing a unique id per token, which helps with trackined token updates and performance.

### Patch Changes

- cbfc5cd7: Changed default `Apply to` setting to `Selection`, this should not change any already stored `Apply to` setting
- cbfc5cd7: You can now "unset" dimension tokens by either removing their token on Inspect or on Tokens view.
- cbfc5cd7: Fixes slow performance of rearranging token sets in the left token set navigation
- cbfc5cd7: Fixed a bug where Inspect would become unresponsive if you had a shadow and a background blur applied on the same node
- cbfc5cd7: Fixes an issue where the token picker didn't show an active state when highlighted
- cbfc5cd7: We now no longer ignore invisible instance children from updating, as we're no longer relying on a Cache. This means you can start using `boolean` tokens in instances.
- cbfc5cd7: Improves performance of internal token resolution logic. This should especially be visible on token sets that have deep nesting of references.
- cbfc5cd7: Fixes a bug that caused nodes to not get updates when min/max width tokens were applied on instances, which caused any subsequent updates to this node to fail. We now ignore instances for min/max width tokens, as they are unsupported by Figma.
- cbfc5cd7: Fixed a bug that caused Composition token's scroll menu to behave weird when scrolling down
- cbfc5cd7: Fixes a bug that caused shadow tokens that were using array values to not get a value if they were redefined in another token set
- cbfc5cd7: Fixed issue that caused theme groups to not play nice with branches, where we'd previously disable the theme groups after branch switching
- cbfc5cd7: Fixed an issue that caused the plugin to crash when typing `[` in the search input.
- cbfc5cd7: Fixed an issue that caused Variable collections to be created twice

## 1.37.11

### Patch Changes

- f8066309: Fixes performance when it comes to applying tokens for users who had a large number of variables in their themes

## 1.37.10

### Patch Changes

- a493af82: Fixes an issue where when a theme has missing variables we'd not apply variables correctly anymore
- 51ebfea9: Fixes an issue where renaming a token or token group would cause `Apply to` to be changed
- 51ebfea9: Fixes an issue where the choice of `Rename styles` was not remembered per session
- 51ebfea9: Fixes an issue with token edit inputs being focused after a timeout

## 1.37.9

### Patch Changes

- b52519ef: Fixes a bug that caused token set order to be ignored when syncing with Supernova
- b5e7b88b: Improves performance of most operations by utilizing a new findAll function to faster traverse the tree of nodes.
- 00bf10e2: Adds support for 2 Supernova environments
- 4aa6e8bb: Changed behavior of editing, duplicating or creating tokens to no longer automatically apply changes. You now need to run `Apply to..` if you want tokens to be updated.
- 0f5ffa33: Cut down speed of `Apply to..` operations to around 40% of where we were before
- b3a0e5bc: - Improved performance of applying by removing unnecessary calls to check if we need to apply a variable.
  - Fixed an issue that caused local variables to be applied if they matched name of an applied token
- 03aa9d05: Slight change of colors as we've detached from Figma's internal tokens
- dd608a7f: Improved performance of the bulk remap function
- dd608a7f: Improves performance of attaching/creating variables for large token sets

## 1.37.8

### Patch Changes

- 9a9f6e26: Updated Second screen UI to work better on smaller sizes, moved language selector to Settings
- d7c42f97: Adds support for Figma's DevMode (thanks Thomas Deser)

## 1.37.7

### Patch Changes

- f8235f7b: Fixed a major performance issue that appeared after 1.37. Times to apply and update nodes should now be down to 10% of what it was before for some files.
- 4a2253d1: Adds support for minWidth, maxWidth, minHeight, maxHeight, counterAxisSpacing on Auto Layout frames and their direct children
  Adds support for 'AUTO' in Spacing tokens to indicate space between on Auto Layout frames

## 1.37.6

### Patch Changes

Bugs addressed:

- 7c6b0391: Fix: Changes frequency where we check for git updates in the background to once every 60 seconds
- 2c41a47f: Fix: Fixes sync tabs being displayed malformed
- fffdd673: Fix: Fixes Apply to document UI description

## 1.37.5

### Patch Changes

Bugs addressed:

- Fixed an issue where autocomplete was not working for Typography tokens
- Fixed an issue where the connection between a variable and token would get lost after pushing and pulling from ADO

## 1.37.4

### Patch Changes

Bugs addressed:

- Fixed two vulnerabilities in dependencies
- Fixed some translations missing from various screens
- Fixed an issue where dragging a theme in the Manage themes modal would cause themes to disappear in the theme dropdown
- Fixed an issue where dragging a theme would under some rare circumstances cause the file to freeze
- Fixed border tokens not working properly inside composition tokens

Improvements:

- Introduced an option to rename tokens in other sets when renaming a single token

## 1.37.3

### Patch Changes

- This release focused on addressing some bugs that was causing theme groups to disappear and other improvements

  Bugs addressed:

  - Fixed an issue where theme groups were not respected for ADO, JSONBin sync and local import
  - Fixed an issue where border color is applied as a style even when variables are present
  - Fixed an issue where color tokens with modifiers were being showing strange behavior on edit
  - Fixed an issue where dragging and dropping a theme from ‘No Group’ to a ‘Group’ hides the ungrouped themes
  - Fixed an issue where the plugin forgets credentials for Second Screen

  Improvements:

  - Introduced internationalisation support on the plugin for French, Dutch, Chinese, Hindi and Spanish
  - Introducing feature to send anonymised crash recordings (needs to be opted in) for better crash analytics

  Other features:

  - Open beta for Second Screen and Token Flow
