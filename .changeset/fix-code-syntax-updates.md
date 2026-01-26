---
"@tokens-studio/figma-plugin": patch
---

Fix code syntax not updating on existing Figma variables

When exporting tokens to existing Figma variables, changes to code syntax (Web, Android, iOS) weren't being applied. The fix ensures metadata updates run once per variable per export run while preventing re-entry by marking variables as processed immediately. This allows code syntax and scopes to be updated correctly without causing the plugin to hang.
