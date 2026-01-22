---
"@tokens-studio/figma-plugin": patch
---

Fix token sets defaulting to unchecked by enabling them by default when no preferences exist

Token sets will now be enabled by default when loading tokens for the first time or when no previous preferences exist. This improves the user experience by avoiding the need to manually enable token sets each time the plugin is opened. Existing user preferences are preserved.