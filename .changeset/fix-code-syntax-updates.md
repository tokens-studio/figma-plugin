---
"@tokens-studio/figma-plugin": patch
---

Add diagnostic logging to investigate code syntax update issue

Reverted to original code and added detailed console logging to help diagnose why code syntax updates aren't working. The logs will show:
- When metadata update block is entered
- Token extension data
- Current vs new code syntax values for each platform
- Whether updates are being applied

This will help identify if the issue is with change detection, the tracker, or the actual update calls.
