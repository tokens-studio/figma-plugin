---
"@tokens-studio/figma-plugin": patch
---

With Tokens Studio sync, Import variables now applies the import as soon as you confirm it, instead of opening a second dialog to pick tokens: the import has already been written to Tokens Studio at that point, so the choice had no effect there. Other sync providers keep the review dialog.

Importing variables into token sets that already exist in Tokens Studio no longer fails when the plugin hasn't recorded the sets' Tokens Studio ids. Before, the plugin tried to create those sets again, Tokens Studio refused the duplicate names, and the imported tokens for those sets never reached Tokens Studio, so they disappeared on the next pull.
