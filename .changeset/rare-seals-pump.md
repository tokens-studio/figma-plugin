---
"@tokens-studio/figma-plugin": patch
---

Fixes a bug that caused nodes to not get updates when min/max width tokens were applied on instances, which caused any subsequent updates to this node to fail. We now ignore instances for min/max width tokens, as they are unsupported by Figma.
