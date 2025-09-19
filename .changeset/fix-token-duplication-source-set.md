---
"@tokens-studio/figma-plugin": patch
---

Fix token duplication bug where tokens were duplicated to source set even when deselected. Now tokens are only duplicated to explicitly selected token sets, allowing users to exclude the source set from duplication.