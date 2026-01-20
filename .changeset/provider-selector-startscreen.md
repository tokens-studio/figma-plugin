---
"@tokens-studio/figma-plugin": patch
---

Add provider selector to StartScreen with automatic token pulling and theme selection

- Added Select dropdown to StartScreen showing saved sync providers when available
- Providers can be selected directly from the start screen without navigating to Settings
- Selected providers automatically pull tokens without confirmation dialogs
- Auto-selects first theme from each theme group when no prior theme selections exist
- Maintains backward compatibility with existing error handling and retry mechanisms