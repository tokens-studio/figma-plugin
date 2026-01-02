---
"@tokens-studio/figma-plugin": patch
---

Add support for creating extended variable collections when pushing themes to Figma. Themes with `$extendsThemeId` will now create child collections using Figma's `.extend()` method, enabling proper variable inheritance between collections.
