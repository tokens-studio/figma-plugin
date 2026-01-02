# Generate Documentation

The Generate Documentation feature allows you to create visual token documentation layers directly on your Figma canvas from your design tokens. This is a Pro feature that helps you showcase and document your design system tokens in a visual format.

## How to Use

1. **Access the feature**: Click the Tools icon (⚡) in the footer of the Tokens Studio plugin, then select "Generate documentation"
2. **Configure your documentation**:
   - **Token set**: Choose "All" to include all token sets, or select a specific token set
   - **Token name filter**: Optionally filter tokens by name:
     - **Starts with**: Enter text to match tokens whose names begin with that text
     - **Regex pattern**: Enable regex mode (⚡ icon) to use regular expressions for more advanced pattern matching
   - **Apply active theme values**: Toggle this option to automatically apply the active theme values to the created layers
3. **Generate**: Click the "Generate" button to create the documentation

## Template Options

### Using the Preset Template

By default, the feature uses a built-in preset template that automatically creates documentation frames with:
- Token name display
- Token value display
- Resolved value display
- Visual representation based on token type (colors, typography, spacing, etc.)

### Using a Custom Template

You can create your own custom template frame to control the exact layout and styling of your documentation:

1. **Create a template frame**: Design a frame with the layout you want for each token
2. **Name layers with special prefixes**: Use layer names starting with `__` (double underscore) to mark where token data should be inserted

#### Supported Layer Names

Layer names starting with `__` (double underscore) are used to mark where token data should be inserted. There are two types of layer names:

##### Documentation Tokens (Text Layers Only)

These layer names are used on **text layers** to display token metadata as text content:

- **`__tokenName`** - Displays the token name (e.g., `color.primary.500`)
- **`__tokenValue`** - Displays the raw token value (e.g., `{r: 0.2, g: 0.4, b: 0.8}`)
- **`__value`** - Displays the resolved token value (e.g., `#3366CC` or the final computed value)
- **`__description`** - Displays the token description if available

**Important**: These must be applied to text layers. The plugin will set the text layer's `characters` property to display the token information.

##### Property Tokens (Visual Properties)

These layer names are used on **any layer type** to apply token values directly to the layer's visual properties. The token value is applied to the corresponding property of the node:

**Sizing Properties:**
- **`__sizing`** - Applies sizing constraints
- **`__height`** - Sets the height
- **`__width`** - Sets the width
- **`__minWidth`** - Sets minimum width
- **`__maxWidth`** - Sets maximum width
- **`__minHeight`** - Sets minimum height
- **`__maxHeight`** - Sets maximum height

**Spacing Properties:**
- **`__spacing`** - Applies spacing
- **`__verticalPadding`** - Sets vertical padding
- **`__horizontalPadding`** - Sets horizontal padding
- **`__counterAxisSpacing`** - Sets counter axis spacing (for auto-layout)
- **`__paddingTop`** - Sets top padding
- **`__paddingRight`** - Sets right padding
- **`__paddingBottom`** - Sets bottom padding
- **`__paddingLeft`** - Sets left padding
- **`__itemSpacing`** - Sets item spacing (for auto-layout)

**Color Properties:**
- **`__fill`** - Applies fill color
- **`__border`** - Applies border color
- **`__borderTop`** - Applies top border color
- **`__borderRight`** - Applies right border color
- **`__borderBottom`** - Applies bottom border color
- **`__borderLeft`** - Applies left border color
- **`__borderColor`** - Applies border color (alternative)

**Border Radius Properties:**
- **`__borderRadius`** - Applies border radius (all corners)
- **`__borderRadiusTopLeft`** - Sets top-left corner radius
- **`__borderRadiusTopRight`** - Sets top-right corner radius
- **`__borderRadiusBottomRight`** - Sets bottom-right corner radius
- **`__borderRadiusBottomLeft`** - Sets bottom-left corner radius

**Border Width Properties:**
- **`__borderWidth`** - Applies border width
- **`__borderWidthTop`** - Sets top border width
- **`__borderWidthRight`** - Sets right border width
- **`__borderWidthBottom`** - Sets bottom border width
- **`__borderWidthLeft`** - Sets left border width

**Effects Properties:**
- **`__boxShadow`** - Applies box shadow
- **`__backgroundBlur`** - Applies background blur
- **`__opacity`** - Sets opacity

**Typography Properties:**
- **`__fontFamilies`** - Sets font family
- **`__fontWeights`** - Sets font weight
- **`__fontSizes`** - Sets font size
- **`__lineHeights`** - Sets line height
- **`__typography`** - Applies complete typography (composite)
- **`__letterSpacing`** - Sets letter spacing
- **`__paragraphSpacing`** - Sets paragraph spacing
- **`__textCase`** - Sets text case
- **`__textDecoration`** - Sets text decoration

**Other Properties:**
- **`__composition`** - Applies composition token (composite)
- **`__dimension`** - Applies dimension value
- **`__text`** - Sets text content (for text tokens)
- **`__number`** - Applies numeric value
- **`__asset`** - Applies asset/image
- **`__visibility`** - Sets visibility
- **`__verticalTrim`** - Sets vertical trim
- **`__rotation`** - Sets rotation
- **`__x`** - Sets X position
- **`__y`** - Sets Y position

#### How Custom Templates Work

1. Create a frame with your desired layout
2. Add layers with names starting with `__` followed by the property name:
   - For **text content**: Use text layers with documentation token names (`__tokenName`, `__value`, etc.)
   - For **visual properties**: Use any layer type with property token names (`__fill`, `__borderRadius`, etc.)
3. Select your template frame before generating documentation
4. The plugin will clone your template for each token and:
   - Populate text layers with documentation tokens (setting the `characters` property)
   - Apply property tokens to the corresponding visual properties of the layers

**Example custom template structure:**
```
My Token Template (Frame)
├── __tokenName (Text layer) ← Displays token name as text
├── __value (Text layer) ← Displays resolved value as text
├── __description (Text layer) ← Displays description as text
├── Color Swatch (Rectangle)
│   └── __fill ← Applies color token to rectangle's fill property
└── Border Preview (Rectangle)
    ├── __borderRadius ← Applies border radius to rectangle
    └── __borderWidth ← Applies border width to rectangle
```

**Key Difference:**
- **Documentation tokens** (`__tokenName`, `__tokenValue`, `__value`, `__description`) → Used on **text layers** to display token information as text
- **Property tokens** (`__fill`, `__borderRadius`, `__width`, etc.) → Used on **any layer** to apply token values to visual properties

## Token Filtering

### By Token Set
- **All**: Includes tokens from all token sets
- **Specific set**: Only includes tokens from the selected token set

### By Name Pattern

#### Simple Prefix Matching
Enter text in the "Token name starts with" field to match tokens whose names begin with that text. For example:
- `color` - matches all tokens starting with "color" (e.g., `color.primary`, `color.secondary`)
- `spacing.small` - matches tokens like `spacing.small.1`, `spacing.small.2`

#### Regex Pattern Matching
Enable regex mode by clicking the ⚡ icon next to the input field. This allows you to use regular expressions for more complex pattern matching:

- `color\.(primary|secondary)` - matches `color.primary` or `color.secondary`
- `^spacing\.(xs|sm|md|lg)$` - matches exact spacing tokens with specific sizes
- `.*\.(500|600)$` - matches any token ending with `.500` or `.600`

## Applying Theme Values

When "Apply active theme values" is enabled, the generated documentation layers will have the active theme's token values applied to them. This means:
- Color tokens will show the actual color values
- Typography tokens will display with the correct font properties
- Spacing and sizing tokens will be visually represented
- Other token types will have their values applied according to your theme configuration

If this option is disabled, the layers will be created but won't have token values applied automatically.

## Tips

- **Organize your documentation**: Generated documentation is organized by token set, making it easy to browse
- **Customize your template**: Create templates that match your design system's documentation style
- **Use regex for complex filtering**: When you need to filter tokens by complex patterns, regex mode gives you full control
- **Combine filters**: Use both token set selection and name filtering together to create focused documentation

## Access Points

The Generate Documentation feature can be accessed from:
- **Footer Tools menu**: Click the ⚡ icon in the plugin footer
- **Token set context menu**: Right-click on a token set and select "Generate documentation"
- **Token group context menu**: Right-click on a token group and select "Generate documentation"


