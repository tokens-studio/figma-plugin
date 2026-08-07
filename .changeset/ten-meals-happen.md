---
"@tokens-studio/figma-plugin": patch
---

Fix Export to Variables writing malformed font-family values (e.g. `[Arial`) when a font-family token's resolved value is an array-shaped string. The bracket-shaped form (`["Arial","Helvetica"]`) is now normalized to the first entry, with JSON parsing so quoted family names containing commas survive intact.
