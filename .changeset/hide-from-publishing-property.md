---
"@tokens-studio/figma-plugin": patch
---

Add "Hide from publishing" property to tokens with three-way checkbox support. This new property allows tokens to be marked as hidden from publishing with three states: true (hidden), false (visible), or undefined (not set/indeterminate). The property is stored in `$extensions['studio.tokens'].hideFromPublishing` and is available for all token types that can create Figma variables. Includes translations for all supported languages (English, Spanish, French, Hindi, Dutch, Chinese).
