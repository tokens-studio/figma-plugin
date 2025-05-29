---
"@tokens-studio/figma-plugin": patch
---

Fix React warning "Cannot update a component while rendering a different component" that occurred when editing tokens and hitting save. The issue was caused by a dispatch call inside a useMemo hook in useChangedState, which has been moved to useEffect to follow React best practices.