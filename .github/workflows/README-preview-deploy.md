# Preview Deployment Workflows

This directory contains GitHub Actions workflows for automatically deploying preview builds of the Tokens Studio Figma Plugin to GitHub Pages.

## Workflows

### `preview-deploy.yml`
**Trigger:** Pull requests that modify files in `packages/tokens-studio-for-figma/`

**What it does:**
1. Builds the preview version of the plugin using `yarn build:preview:gh-pages`
2. Creates a deployment directory structure: `_site/pr-{PR_NUMBER}/`
3. Deploys to GitHub Pages at: `https://{owner}.github.io/{repo}/pr-{PR_NUMBER}/`
4. Posts a comment on the PR with direct links to different plugin scenarios

### `cleanup-previews.yml`
**Triggers:** 
- When PRs are closed
- Weekly schedule (Sundays at 2 AM UTC)

**What it does:**
1. Removes preview deployments for closed PRs
2. Updates the index page with remaining active previews
3. Keeps the GitHub Pages deployment clean and organized

## Preview URLs

Each PR gets its own preview deployment with these quick-access links:

- **Fresh Start**: `/#tab=start&action=FRESH_START`
- **Basic Tokens**: `/#tab=tokens&action=WITH_BASIC_TOKENS`
- **Complex System**: `/#tab=tokens&action=WITH_COMPLEX_TOKENS`
- **GitHub Sync**: `/#tab=settings&action=WITH_GITHUB_SYNC`
- **Inspector Mode**: `/#tab=inspector&action=INSPECTOR_MODE`

Theme variations:
- **Dark Theme**: `&theme=dark`
- **Fullscreen**: `&fullscreen=true`

## Requirements

### Repository Settings
1. **GitHub Pages must be enabled** in repository settings
2. **Source should be set to "GitHub Actions"**
3. **Permissions**: The workflows require `pages: write` and `id-token: write` permissions

### Secrets
No additional secrets are required beyond the default `GITHUB_TOKEN`.

## Benefits

- **Easy Testing**: Reviewers can test changes without building locally
- **Screenshot Generation**: Perfect for creating documentation screenshots
- **Demo Links**: Share specific plugin states with stakeholders
- **Cross-browser Testing**: Test in different environments
- **Mobile Testing**: Access preview from mobile devices

## File Structure

```
GitHub Pages deployment:
├── index.html (main landing page)
├── pr-123/ (PR #123 preview)
│   ├── index.html
│   ├── ui.js
│   └── code.js
├── pr-456/ (PR #456 preview)
└── ...
```

## Usage

1. **Create/Update PR** - Workflow automatically triggers
2. **Wait for deployment** - Usually takes 2-3 minutes
3. **Use preview link** - Posted as PR comment
4. **Test scenarios** - Use quick links for different plugin states
5. **Generate screenshots** - Perfect for documentation

## Troubleshooting

**Preview not deploying?**
- Check that GitHub Pages is enabled in repository settings
- Verify the workflow has proper permissions
- Check workflow logs for build errors

**Old previews not cleaning up?**
- The cleanup workflow runs weekly and when PRs close
- Manually trigger cleanup workflow if needed

**Links not working?**
- Ensure the preview build completed successfully
- Check that the plugin source files weren't corrupted during build