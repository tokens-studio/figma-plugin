---
"@tokens-studio/figma-plugin": patch
---

Fixed an issue with "zombie variables". Basically, even though a Figma file shows 0 variables, Figma's plugin API will sometimes tell us there's variables existing - probably ones that existed in the past but should be deleted - Figma seems to report those as existing still. This led to issues around applying and referencing variables where we'd point to those zombies. We now correctly check if the variable's collection still exist, and only then use those as references.
