---
"@tokens-studio/figma-plugin": patch
---

Themes whose group name has spaces or other characters Tokens Studio doesn't allow in a theme group name, such as an imported Figma collection called "Brand Core", now sync to Tokens Studio. The group is created there as "Brand-Core"; the plugin keeps showing the original name.
