# Web Preview

The Figma plugin includes a comprehensive web preview system for testing, development, and screenshot generation. This allows you to view and interact with the plugin interface in a browser environment.

## Getting Started

1. Navigate to the plugin directory:
   ```sh
   cd packages/tokens-studio-for-figma
   ```

2. Start the development preview:
   ```sh
   yarn preview
   ```
   This runs the preview on `http://localhost:9000`

3. Or build and serve a static version:
   ```sh
   yarn build:preview
   yarn serve:preview  # serves on http://localhost:58630
   ```

## Available Example Scenarios

The preview includes several predefined scenarios to demonstrate different plugin states:

### 🆕 Fresh Start
- **URL**: `#tab=start&action=FRESH_START`
- **Description**: Brand new plugin experience with no tokens loaded
- **Use case**: Testing onboarding flow, taking screenshots for getting started guides

### 🎨 Basic Design Tokens  
- **URL**: `#tab=tokens&action=WITH_BASIC_TOKENS`
- **Description**: Simple token setup with colors, spacing, and typography
- **Use case**: Demonstrating basic token management features

### 🏗️ Complex Token System
- **URL**: `#tab=tokens&action=WITH_COMPLEX_TOKENS` 
- **Description**: Multi-level token architecture with aliases and references
- **Use case**: Testing advanced token features, nested references

### 🔄 GitHub Sync Setup
- **URL**: `#tab=settings&action=WITH_GITHUB_SYNC`
- **Description**: Plugin configured with GitHub synchronization
- **Use case**: Testing sync providers, demonstrating remote workflow

### 🔍 Inspector Mode
- **URL**: `#tab=inspector&action=INSPECTOR_MODE`
- **Description**: Plugin in inspection mode for analyzing elements
- **Use case**: Testing inspector functionality

## Theme and Layout Options

- **Dark Theme**: Add `&theme=dark` to any URL
- **Fullscreen**: Add `&fullscreen=true` to any URL
- **System Theme**: Add `&theme=system` to any URL

## Development Workflow

1. **Choose appropriate scenario** based on the feature you're working on
2. **Make code changes** and see them reflected in the preview
3. **Take screenshots** for documentation or issue reports
4. **Test across different scenarios** to ensure compatibility
5. **Use browser dev tools** for debugging CSS and JavaScript

## Taking Screenshots

The preview is perfect for generating screenshots:

1. Navigate to desired scenario URL
2. Use browser screenshot tools or extensions
3. Screenshots can be used in:
   - Documentation
   - Issue reports  
   - Feature demonstrations
   - Marketing materials

## Mock Data Structure

The preview uses realistic mock data that includes:
- Sample token collections
- Theme configurations
- User settings
- Provider configurations

This provides an authentic testing environment without requiring the Figma plugin sandbox.
