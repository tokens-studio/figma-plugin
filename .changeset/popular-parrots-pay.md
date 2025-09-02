---
"@tokens-studio/figma-plugin": minor
---

Atlassian is deprecating Bitbucket's App Passwords. As we were using this, we now offer the option to enter an API token instead. Existing App password setups will still work until June 9th, 2026. We added a migration warning, any new Bitbucket sync providers will need to use API tokens. Existing ones can still use App passwords, but we recommend switching over. Read more: https://docs.tokens.studio/token-storage/remote/sync-git-bitbucket
