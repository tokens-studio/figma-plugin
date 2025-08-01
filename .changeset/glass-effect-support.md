---
"@tokens-studio/figma-plugin": patch
---

Add support for Glass effect type in design tokens with structured JSON schema approach

- Added GLASS type to BoxShadowTypes enum
- Implemented Glass effect as BACKGROUND_BLUR in Figma API
- Updated effect value types to support Glass effects with optional properties  
- Created structured JSON schema for effects validation
- Added comprehensive tests for Glass effect functionality
- Enhanced effect system for future extensibility