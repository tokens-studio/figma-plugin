# Preview Mode Guide

This guide covers the enhanced preview functionality of the Tokens Studio Figma Plugin. The preview system allows you to view and test the plugin interface in a browser environment, making it ideal for development, testing, and documentation.

## 🚀 Quick Start

```bash
# Navigate to the plugin directory
cd packages/tokens-studio-for-figma

# Start development preview (with hot reload)
yarn preview
# Access at: http://localhost:9000

# Or build static preview
yarn build:preview
yarn serve:preview
# Access at: http://localhost:58630
```

## 📋 Available Example Scenarios

### 1. Fresh Start (`#tab=start&action=FRESH_START`)
- **Description**: Brand new plugin experience with no tokens loaded
- **Use cases**: 
  - Testing onboarding flows
  - Screenshots for getting started guides
  - Demonstrating first-time user experience

### 2. Basic Design Tokens (`#tab=tokens&action=WITH_BASIC_TOKENS`)
- **Description**: Simple token setup with colors, spacing, and typography
- **Includes**: Color palette, spacing scale, typography system
- **Use cases**: 
  - Basic token management demos
  - Tutorial screenshots
  - Simple workflow testing

### 3. Complex Token System (`#tab=tokens&action=WITH_COMPLEX_TOKENS`)
- **Description**: Multi-level token architecture with aliases and references
- **Includes**: Core tokens, semantic tokens, component tokens
- **Use cases**: 
  - Advanced feature testing
  - Complex reference resolution
  - Multi-theme scenarios

### 4. GitHub Sync Setup (`#tab=settings&action=WITH_GITHUB_SYNC`)
- **Description**: Plugin configured with GitHub synchronization
- **Includes**: Remote provider setup, sync status, credentials
- **Use cases**: 
  - Testing sync providers
  - Demonstrating remote workflows
  - Troubleshooting sync issues

### 5. Inspector Mode (`#tab=inspector&action=INSPECTOR_MODE`)
- **Description**: Plugin in inspection mode for analyzing elements
- **Includes**: Inspector interface, token application detection
- **Use cases**: 
  - Testing inspector functionality
  - Element analysis workflows
  - Token application screenshots

## 🎨 Theme & Layout Options

Add these parameters to any URL:

- **Dark Theme**: `&theme=dark`
- **Light Theme**: `&theme=light`
- **System Theme**: `&theme=system`
- **Fullscreen Mode**: `&fullscreen=true`

### Example URLs

```
# Dark theme with complex tokens
http://localhost:58630/#tab=tokens&action=WITH_COMPLEX_TOKENS&theme=dark

# Fullscreen inspector mode
http://localhost:58630/#tab=inspector&action=INSPECTOR_MODE&fullscreen=true

# Settings page with GitHub sync in system theme
http://localhost:58630/#tab=settings&action=WITH_GITHUB_SYNC&theme=system
```

## 📸 Taking Screenshots

The preview is perfect for generating documentation screenshots:

1. **Navigate to desired scenario** using the quick links or URL parameters
2. **Adjust theme and layout** as needed
3. **Use browser screenshot tools** or automated tools like Playwright
4. **Screenshots are useful for**:
   - Documentation updates
   - Issue reports
   - Feature announcements
   - Tutorial materials

### Screenshot Best Practices

- Use consistent browser window sizes
- Choose appropriate themes (light for documentation, dark for demos)
- Include relevant UI states (expanded menus, modals, etc.)
- Consider mobile/responsive views for mobile documentation

## 🛠 Development Workflow

### For Plugin Development
1. **Start preview** with your preferred scenario
2. **Make code changes** in the plugin source
3. **Refresh browser** to see updates (or use hot reload)
4. **Test across scenarios** to ensure compatibility
5. **Take before/after screenshots** for documentation

### For UI Development
1. **Use appropriate scenario** that showcases your feature
2. **Test responsive behavior** by resizing browser window
3. **Verify theme support** by switching themes
4. **Use browser dev tools** for CSS debugging
5. **Test accessibility** with browser accessibility tools

## 🔍 Debugging Tips

### Browser Developer Tools
- **Console**: View plugin logs and errors
- **Network**: Monitor API calls and resource loading
- **Elements**: Inspect and modify DOM/CSS
- **Sources**: Debug JavaScript/TypeScript code
- **Accessibility**: Test screen reader compatibility

### Common Issues
- **Tokens not loading**: Check console for JavaScript errors
- **Styles not applying**: Verify CSS variables and theme tokens
- **Performance issues**: Use Performance tab to identify bottlenecks
- **Memory leaks**: Monitor Memory tab during extended use

## 📦 Mock Data Structure

The preview uses realistic mock data:

```typescript
// Basic token structure
{
  colors: {
    primary: { $value: '#2563eb', $type: 'color' },
    secondary: { $value: '#64748b', $type: 'color' }
  },
  spacing: {
    xs: { $value: '4px', $type: 'spacing' },
    sm: { $value: '8px', $type: 'spacing' }
  }
}

// Complex token structure with references
{
  'core/colors': {
    'blue-500': { $value: '#3b82f6', $type: 'color' }
  },
  'semantic/colors': {
    'primary': { $value: '{core/colors.blue-500}', $type: 'color' }
  }
}
```

## 🚦 API Reference

### Quick Link Functions
```typescript
// Navigate to specific scenarios
onQuickLinkClick(hash: string): void

// Available hash parameters
#tab=start|tokens|inspector|json|settings
&action=FRESH_START|WITH_BASIC_TOKENS|WITH_COMPLEX_TOKENS|WITH_GITHUB_SYNC|INSPECTOR_MODE
&theme=light|dark|system
&fullscreen=true|false
```

### Mock Actions
```typescript
// Trigger mock startup scenarios
dispatchMockMessage(mockActions[action])

// Available actions
STARTUP, FRESH_START, WITH_BASIC_TOKENS, 
WITH_COMPLEX_TOKENS, WITH_GITHUB_SYNC, INSPECTOR_MODE
```

## 🔧 Extending the Preview

To add new scenarios:

1. **Create mock data** for your scenario
2. **Add to mockActions object** in `preview.tsx`
3. **Update dropdown options** with user-friendly labels
4. **Add quick link** if it's a common use case
5. **Document the scenario** in this guide

### Example: Adding Custom Scenario

```typescript
// In mockActions object
MY_SCENARIO: {
  type: AsyncMessageTypes.STARTUP,
  // ... your mock data
  localTokenData: {
    values: myCustomTokens,
    themes: myCustomThemes,
    // ... other properties
  }
}

// In dropdown options
{ type: 'MY_SCENARIO', label: 'My Custom Scenario' }

// In quick links (if appropriate)
{ hash: '#tab=tokens&action=MY_SCENARIO', label: 'Custom Demo' }
```

This enhanced preview system provides a comprehensive testing environment that supports the full development lifecycle from initial development through documentation and user support.