---
"@tokens-studio/figma-plugin": patch
---

Fix duplicate Tokens Studio sync providers appearing in Sync Settings. Tokens Studio OAuth providers are derived live from the user's organizations and are no longer persisted to client storage. Any legacy persisted OAuth entries are stripped on read, and the Sync Settings list now defensively dedupes against live OAuth providers.
