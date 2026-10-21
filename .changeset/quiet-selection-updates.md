---
"@tokens-studio/figma-plugin": patch
---

Fixed the plugin freezing briefly on large token sets whenever the Figma selection changed, after applying a token, when opening or closing the token edit form, or when collaborators edited the file. These freezes made token tooltips show up late or not at all. Each selection update now takes a fraction of the time, and remote edits outside your selection no longer refresh it.
