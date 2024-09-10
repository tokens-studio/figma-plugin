---
"@tokens-studio/figma-plugin": minor
---

Changed logic around how we create styles or variables around Theming, as well as the logic around token sets and themes. 2.0 introduced some changes that made the whole process more strict. This change now changes things the other way around, we're less strict. Basically, if you export themes and you are exporting multiple themes at once, we now look at the overall configuration of token sets and pass these on as tokens to use for resolution. Meaning, you should not run into issues where you have broken references anymore just because a token set was disabled. If a set contains a token - even if the set is disabled - we will use it to resolve references.
