---
"@tokens-studio/figma-plugin": patch
---

Fixed a bug where Bitbucket read-only tokens didn't properly indicate that changes couldn't be made. Now Bitbucket correctly checks for write permissions and prevents push operations when using read-only tokens.