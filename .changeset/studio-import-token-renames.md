---
"@tokens-studio/figma-plugin": patch
---

With Tokens Studio sync, importing variables after renaming a variable now renames its token in Tokens Studio and in the plugin, instead of adding a second token next to the old one. Changed variable values are now sent to Tokens Studio as well; before, they only changed in the plugin and came back on the next pull.

Themes imported from variables now also update when only their variables changed, so they point at the renamed or added tokens.
