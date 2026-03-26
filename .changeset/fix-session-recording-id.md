---
"@tokens-studio/figma-plugin": patch
---

Fix session recording ID initialization in Settings: use the configured Sentry Replay instance, await replay ID retrieval, clear session ID on stop, and prevent unnecessary re-renders
