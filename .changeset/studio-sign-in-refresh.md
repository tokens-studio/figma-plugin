---
"@tokens-studio/figma-plugin": patch
---

Fixed Tokens Studio sync failing with "Failed to fetch project data from REST API" a day after signing in. The plugin now renews the sign-in before pulling and retries once when the server rejects an expired token. When the sign-in has really ended, it asks you to sign in again instead of pointing to your subscription, and a project that syncs Figma variables now says it cannot be pulled as tokens.
