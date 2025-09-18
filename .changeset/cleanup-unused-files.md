---
"@tokens-studio/figma-plugin": patch
---

Cleanup unused files and dependencies

Removed unused files and dependencies that were leftover from previous development:
- Removed unused `dota-vertical.svg` icon file that had no references in the codebase
- Removed obsolete `tslint.json` configuration file (project now uses ESLint)
- Removed empty `package-lock.json` file (project uses Yarn)
- Removed TSLint dependencies (`tslint` and `tslint-react`) from package.json
- Cleaned up TSLint disable comments in test files