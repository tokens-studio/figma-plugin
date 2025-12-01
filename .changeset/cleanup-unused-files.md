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
- Removed entire `token-transformer/` directory containing old package source code (now published separately on npm)
- Removed unused `script.js` and `webpack-transform.config.js` files
- Removed related npm scripts (`build-transform`, `watch-transform`) and Jest configuration
- Cleaned up VSCode debug configuration for removed token-transformer