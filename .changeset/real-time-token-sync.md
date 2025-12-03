---
"@tokens-studio/figma-plugin": patch
---

Enable real-time multi-user sync for local token storage

- Added automatic detection of token data changes from other users via Figma's document change events
- Tokens are now automatically reloaded when another user modifies them in the same file
- Users see updated tokens without needing to manually refresh or restart the plugin
- Prevents data loss by ensuring all users see the latest token changes in real-time
