---
'@tokens-studio/figma-plugin': patch
---

Switch Figma native theme mode when users change themes in plugin

When users apply tokens to selection or switch themes, the plugin now automatically switches Figma's native variable mode to match the selected theme. The mode switching respects the update mode setting:

- **Apply to selection**: Only affects the current root selection nodes
- **Apply to page**: Only affects top-level frames in the current page  
- **Apply to document**: Only affects top-level frames across all pages

This ensures that Figma's native theme mode stays in sync with the plugin's active theme.