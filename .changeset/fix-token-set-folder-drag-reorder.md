---
"@tokens-studio/figma-plugin": patch
---

Fix token set folder drag-reorder scrambling order when folders are expanded

The drag-and-drop reorder for token set folders was producing incorrect results
when folders were expanded. The root cause was in `ensureFolderIsTogether` which
only moved direct children of a dragged folder, leaving grandchildren (items in
nested sub-folders) behind. This fix replaces the delta-based approach with a
grouping approach that collects all descendants (direct and nested) and places
them right after the folder in their original relative order.

Additionally fixed a path-boundary bug in `findOrderableTargetIndexesInTokenSetTreeList`
and `TokenSetTree` where `startsWith` without a `/` separator could falsely match
sibling folders whose names share a common prefix (e.g. "themes" and "themes2").
