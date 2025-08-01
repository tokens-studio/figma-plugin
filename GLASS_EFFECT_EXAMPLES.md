# Glass Effect Usage Examples

## Basic Glass Effect Token

```json
{
  "glass": {
    "subtle": {
      "value": {
        "type": "glass",
        "blur": 10
      },
      "type": "boxShadow",
      "description": "Subtle glass effect for modal overlays"
    },
    "strong": {
      "value": {
        "type": "glass", 
        "blur": 20
      },
      "type": "boxShadow",
      "description": "Strong glass effect for prominent UI elements"
    }
  }
}
```

## W3C Token Format

```json
{
  "glass": {
    "modal": {
      "$value": {
        "type": "glass",
        "blur": 15
      },
      "$type": "boxShadow",
      "$description": "Glass effect for modal backgrounds"
    }
  }
}
```

## Mixed Effects (Shadow + Glass)

```json
{
  "card": {
    "elevated": {
      "value": [
        {
          "type": "dropShadow",
          "color": "rgba(0,0,0,0.1)",
          "x": 0,
          "y": 4,
          "blur": 8,
          "spread": 0
        },
        {
          "type": "glass",
          "blur": 12
        }
      ],
      "type": "boxShadow",
      "description": "Elevated card with shadow and glass effect"
    }
  }
}
```

## Schema Validation

The new effect schema ensures proper validation:

- Glass effects can only have `type`, `blur`, and `blendMode` properties
- Shadow effects require `type`, `color`, `x`, `y`, `blur`, and `spread` properties
- Mixed arrays of effects are supported
- String references to other tokens are allowed