# @tokens-studio/figma-plugin

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
