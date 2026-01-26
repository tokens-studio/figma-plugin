---
"@tokens-studio/figma-plugin": patch
---

Fix code syntax not updating when editing tokens

The root cause was identified: when editing a token in the UI, the code syntax values were saved to the token's `$extensions['com.figma'].codeSyntax`, but the `updateVariablesFromPlugin` function only updated the variable's value, not its metadata (scopes and code syntax).

Now when a token is edited, both the variable value AND metadata are updated, ensuring code syntax changes are immediately reflected in the linked Figma variable.
