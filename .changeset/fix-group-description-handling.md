---
"@tokens-studio/figma-plugin": patch
---

Fix handling of $description at group and root level to comply with DTCG specification. Group and root level descriptions are no longer incorrectly converted to tokens with type "other". They are now properly preserved as metadata when provided through the API.
