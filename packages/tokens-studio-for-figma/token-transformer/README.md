# Token Transformer

Converts tokens from Tokens Studio for Figma to something Style Dictionary can read, removing any math operations or aliases, only resulting in raw values.

## CLI usage

### How to use

Install (either globally or local)
`npm install token-transformer -g`

`node token-transformer input output sets excludes`

`node token-transformer input.json output.json global,dark,components global`

`node token-transformer input.json output.json --expandTypography=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false --expandComposition=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false --expandComposition=false --expandBorder=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false --expandComposition=false --expandBorder=false --preserveRawValue=true`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false --expandComposition=false  --expandBorder=false --preserveRawValue=true resolveReferences=false`

You can also set a directory as an input instead of providing just one file.

`node token-transformer src output.json core/colors,themes/dark core/colors`

### Parameters

Input: Filename of input

Output: Filename of output

Sets: Sets to be used, comma-seperated

Excludes: Sets that should not be part of the export (e.g. a global color scale)

--expandTypography: true|false to enable/disable automatic expansion of typography types (default: false)

--expandShadow: true|false to enable/disable automatic expansion of boxShadow types (default: false)

--preserveRawValue: true|false to enable/disable addition of a rawValue key containing the unresolved value (default: false)

--throwErrorWhenNotResolved: true|false to enable/disable throwing errors when a reference fails to resolve (default: false)

--resolveReferences: true|false|'math' to enable/disable resolving references, removing any aliases or math expressions (default: true)

## Programmatic usage

This library can also be used programmatically to resolve tokens without giving it access to the underlying file system.

```js
const { transformTokens } = require('token-transformer');

const rawTokens = {
    setA:{
        "sizing": {
            "base": {
            "value": "4",
            "description": "Alias value",
            "type": "sizing"
            },
            "large": {
            "value": "$sizing.base * 2",
            "description": "Math value",
            "type": "sizing"
            }
        }
    }
};

const setsToUse = ['setA'];
const excludes = [];

const transformerOptions = {
  expandTypography: true,
  expandShadow: true,
  expandComposition: true,
  expandBorder: true,
  preserveRawValue: false,
  throwErrorWhenNotResolved:  true,
  resolveReferences:true
}

const resolved = transformTokens(rawTokens,setsToUse, excludes,transformerOptions);

/*{
  sizing: {
    base: { value: 4, description: 'Alias value', type: 'sizing' },
    large: { value: 8, description: 'Math value', type: 'sizing' } 
  }
}*/

```