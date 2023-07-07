# @tokens-studio/figma-plugin

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
