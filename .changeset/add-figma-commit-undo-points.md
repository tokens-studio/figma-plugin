---
"@tokens-studio/figma-plugin": patch
---

Add figma.commitUndo() calls at key points where tokens are applied or removed from Figma layers

This adds undo points before major operations that change what's applied to Figma layers:
- When applying token values to nodes (setValuesOnNode)  
- When removing token values from nodes (removeValuesFromNode)
- When updating/setting node data with tokens
- When removing tokens by value
- When remapping or bulk remapping tokens  
- When swapping styles between themes
- When applying tokens to living documentation

This allows users to use Figma's native undo (Cmd/Ctrl+Z) to revert token application operations in logical chunks.