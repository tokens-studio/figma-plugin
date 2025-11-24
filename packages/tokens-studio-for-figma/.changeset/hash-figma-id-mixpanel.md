---
"@tokens-studio/figma-plugin": patch
---
Hash Figma user ID before sending to Mixpanel, and remove user name from all Mixpanel events. Uses a secret from the environment for hashing, ensuring privacy and consistent identification for bulk Mixpanel operations.