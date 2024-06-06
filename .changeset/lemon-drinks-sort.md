---
"@tokens-studio/figma-plugin": patch
---

When you apply a token to a layer, and that token isnt connected to a variable, we will now try to apply the token's reference as a variable. This enables you to apply component tokens and have their semantic variable applied as long as it's a pure reference and that component token has no variable connected.
