---
'@tokens-studio/figma-plugin': minor
---

**Swap Figma variable modes**

The plugin can now automatically switch Figma's native variable modes when you change themes, keeping your variables in sync with your active theme.

**What's new:**
- **Automatic mode switching**: When switching themes, the plugin updates Figma's variable modes to match the selected theme
- **Configurable setting**: Toggle "Swap Figma variable modes" in the plugin settings (bottom right) to enable/disable this behavior (enabled by default)
- Validates that collections and modes exist before switching, with helpful error notifications when something goes wrong
- Works with Selection, Page, and Document update modes