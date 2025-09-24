---
"@tokens-studio/figma-plugin": patch
---

Fix text styles import crashes by adding comprehensive error handling and null checks throughout the pullStyles function. This prevents the plugin from crashing when encountering malformed text styles with missing or invalid properties.