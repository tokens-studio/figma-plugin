---
"@tokens-studio/figma-plugin": patch
---

Tokens Studio sync now follows the org's plan instead of requiring the plugin plan:

- Orgs on the Free plan can connect files and switch projects. Free doesn't include Pro.
- Orgs on a Variables plan can't connect new files or switch projects. Sync settings shows a notice for them; a file that is already connected keeps its connection.
- Orgs without Studio or plugin access, or whose access is unknown, can't be applied. The row explains why, and the check also runs when tokens load, so it can't be bypassed from the keyboard.
- Pro now requires the plugin plan, an editor seat and a paid, trialing or custom plan status. Any other status (Free, expired, missing) no longer counts, and plans named "Partner" no longer bypass the check.
- In a file synced with Tokens Studio, the org (and so Pro) comes from the org the file syncs with. Applying an org in one file no longer changes the org used in other files.
- Plan labels read the plan status: "Free" for Free orgs, "Expired" for expired plans (was "Trial expired"), and "No plan" for orgs without a plan (was "Starter").
