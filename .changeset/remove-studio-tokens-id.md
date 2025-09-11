---
"@tokens-studio/figma-plugin": patch
---

Remove all functionality related to 'id' field in studio.tokens extension

Removed addIdPropertyToTokens, removeTokenId, and removeIdPropertyFromTokens utility functions along with all related code and test expectations. The studio.tokens extension will no longer include an automatically generated id field.

Added cleanup logic to remove legacy 'id' fields from existing studio.tokens extensions during token parsing to ensure compatibility with tokens that may still contain these fields.