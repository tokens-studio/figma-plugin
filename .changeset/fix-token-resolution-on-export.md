---
"@tokens-studio/figma-plugin": patch
---

Fix bug where tokens were incorrectly resolved during export when expand options are enabled. When using "Export to JSON" with options like "Expand Typography" enabled, alias tokens (references like `{typography.heading.h1}`) will now keep their references instead of being resolved to actual values. This preserves the token relationships needed for downstream processing pipelines.
