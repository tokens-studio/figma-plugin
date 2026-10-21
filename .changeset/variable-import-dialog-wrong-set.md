---
"@tokens-studio/figma-plugin": patch
---

Fixed several issues when importing variables. Updating or creating a single token in the import dialog now writes to the token's own set instead of the currently active set, and no longer removes same-named rows of other sets from the dialog. Value changes in a collection that was renamed in Figma are now applied on "Import all" instead of being silently dropped. Updated tokens now keep their Tokens Studio id and other plugin metadata instead of losing it on import.
