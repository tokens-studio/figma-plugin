---
"@tokens-studio/figma-plugin": patch
---
We now no longer ignore invisible instance children from updating, as we're no longer relying on a Cache. This means you can start using `boolean` tokens in instances.