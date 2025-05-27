# Purple Theme

A new purple color theme has been added to the Tokens Studio for Figma project. This theme provides a beautiful purple color scheme that can be used as an alternative to the existing light and dark themes.

## Features

The purple theme includes:

- **Primary Colors**: Based on purple color scale (purple.100 through purple.900)
- **Background Colors**: Light purple backgrounds with subtle variations
- **Text Colors**: Dark purple text for excellent readability
- **Accent Colors**: Rich purple accents for interactive elements
- **Shadows**: Purple-tinted shadows for depth and consistency
- **Component Styling**: Pre-configured purple styling for cards, buttons, and other components

## Color Palette

### Background Colors
- **Default Background**: `#faf5ff` (purple.100) - Very light purple for main background
- **Muted Background**: `#e9d8fd` (purple.200) - Slightly darker for secondary areas
- **Subtle Background**: `#d6bcfa` (purple.300) - For elevated components

### Text Colors
- **Primary Text**: `#44337a` (purple.900) - Dark purple for main text
- **Secondary Text**: `#6b46c1` (purple.700) - Medium purple for secondary text
- **Muted Text**: `#9f7aea` (purple.500) - Lighter purple for muted text

### Accent Colors
- **Primary Accent**: `#805ad5` (purple.600) - Main interactive color
- **Accent Emphasis**: `#6b46c1` (purple.700) - For hover/active states
- **Accent Text**: `#ffffff` (white) - Text on accent backgrounds

## File Structure

The purple theme is implemented across several files:

### 1. Theme Definition
- `packages/tokens-studio-for-figma/token-transformer/tokens/themes/purple.json`
  - Contains the core purple theme token definitions
  - Includes background, text, and component styling tokens

### 2. Theme Configuration
- `packages/tokens-studio-for-figma/token-transformer/tokens/$themes.json`
  - Registers the purple theme in the theme system
  - Defines which token sets are enabled for the purple theme

### 3. Color Tokens
- `packages/tokens-studio-for-figma/src/config/default.json`
  - Contains the purple color scale definitions
  - Includes the purple theme variant configuration

### 4. Stitches Integration
- `packages/tokens-studio-for-figma/src/stitches.config.ts`
  - Exports `purpleThemeMode` for use in React components
  - Defines purple theme specific styling properties

## Usage

### In Token Studio
1. The purple theme will appear in the theme selector
2. Select "themes-folder-purple" to apply the purple theme
3. All components will automatically use the purple color scheme

### In Code
```typescript
import { purpleThemeMode } from '@/stitches.config';

// Apply purple theme to a component
<div className={purpleThemeMode}>
  Your content here
</div>
```

### CSS Classes
The purple theme can be applied by adding the `figma-purple` class to any element:

```html
<div class="figma-purple">
  Purple themed content
</div>
```

## Component Examples

### Cards
Cards in the purple theme will have:
- Light purple fill (`backgroundSubtle`)
- Purple border (`primary`)
- Rounded corners

### Buttons
Primary buttons will feature:
- Purple background (`primary`)
- White text
- Darker purple border (`primaryDark`)

### Text Elements
- Headings use `text.primary` (dark purple)
- Body text uses `text.secondary` (medium purple)
- Muted text uses `text.muted` (light purple)

## Customization

The purple theme can be customized by modifying the token values in:
- `purple.json` - Core theme tokens
- `default.json` - Purple color variants
- `stitches.config.ts` - React/CSS integration

## Accessibility

The purple theme maintains excellent contrast ratios:
- Primary text (`#44337a`) on light background (`#faf5ff`) - High contrast
- Secondary text (`#6b46c1`) on light background - Good contrast
- Accent colors provide sufficient contrast for interactive elements

## Browser Support

The purple theme works in all modern browsers and is fully compatible with:
- Chrome/Chromium
- Firefox
- Safari
- Edge

---

For questions or contributions, please refer to the main project documentation.