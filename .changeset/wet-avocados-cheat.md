---
"@tokens-studio/figma-plugin": patch
---

Fixes sync with Bitbucket provider:

- Pull when the option is to sync with a single file was not working
- Push was removing all other .json files in the selected folder (either root of the chosen folder)