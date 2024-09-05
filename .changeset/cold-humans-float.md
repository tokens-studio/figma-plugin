---
"@tokens-studio/figma-plugin": patch
---

Changed logic when "Remove styles and variables without connection to a token" is enabled where we now look at all created tokens in this session and remove them, instead of looking at each theme individually
