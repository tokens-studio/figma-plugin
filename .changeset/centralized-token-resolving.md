---
"@tokens-studio/figma-plugin": patch
---

Move token resolving to Redux state for centralized management

- Add resolvedTokens and tokenSetsWithBrokenReferences to TokenState
- Add selectors for accessing resolved tokens and broken reference sets
- Add updateResolvedTokens effect to handle token resolution
- Update Tokens component to use resolved tokens from Redux state instead of local computation
- Trigger token resolution updates when tokens, usedTokenSet, or activeTokenSet change
- Enable centralized tracking of which token sets have broken references