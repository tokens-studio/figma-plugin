---
'@tokens-studio/figma-plugin': patch
---

Reintroduces support for nested references for 1 level deep (use at your own risk, this affects performance). For example, you can use `{colors.{primary}.500}` but not `{colors.{brand.{primary}}}`.
