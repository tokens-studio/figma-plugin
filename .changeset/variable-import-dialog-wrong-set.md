---
"@tokens-studio/figma-plugin": patch
---

Fixed two issues in the variable import dialog. Updating or creating a single token now writes to the token's own set instead of the currently active set, and no longer removes same-named rows of other sets from the dialog. Value changes in a collection that was renamed in Figma are now applied on "Import all" instead of being silently dropped.
