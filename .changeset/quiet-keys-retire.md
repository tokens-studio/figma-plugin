---
"@tokens-studio/figma-plugin": patch
---

Fixed a "License key invalid" error for users signed in with a Tokens Studio account that has Pro. When the account has Pro, the plugin now forgets an old license key that's still stored instead of checking it.
