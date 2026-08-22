---
"@tokens-studio/figma-plugin": patch
---

Fix styles being marked as changed and needing republish in Figma after exporting again with no actual token changes. The main cause was `unbindVariableFromTarget` unconditionally rewriting a color style's paint on every export, even when there was no bound variable to remove and the value already matched. Effect, typography, and style-description writes now skip the same way when the resolved value hasn't changed.
