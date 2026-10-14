---
"@tokens-studio/figma-plugin": patch
---

Importing variables while a file syncs with Tokens Studio now asks for confirmation first. The import creates token sets, tokens and themes in the connected Tokens Studio project straight away, and the confirmation says so, names the branch and shows how many sets, tokens and themes it can add. Cancelling leaves both the plugin and Tokens Studio unchanged. Other sync providers are not affected.
