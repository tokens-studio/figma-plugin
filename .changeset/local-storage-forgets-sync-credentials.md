---
"@tokens-studio/figma-plugin": patch
---

Switching a file from Tokens Studio sync (or another sync provider) to local document storage now really disconnects it. Before, the plugin kept the previous provider's connection for the rest of the session, so importing variables still asked to write to Tokens Studio, and edits could still be sent there.
