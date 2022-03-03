# Token Transformer

Converts tokens from Figma Tokens to something Style Dictionary can read, removing any math operations or aliases, only resulting in raw values.

## How to use

Install (either globally or local)
`npm install token-transformer -g`

`node token-transformer input output sets excludes`

`node token-transformer input.json output.json global,dark,components global`

`node token-transformer input.json output.json --expandTypography=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false`

`node token-transformer input.json output.json --expandTypography=false --expandShadow=false --preserveRawValue=true`

## Parameters

Input: Filename of input

Output: Filename of output

Sets: Sets to be used, comma-seperated

Excludes: Sets that should not be part of the export (e.g. a global color scale)

--expandTypography: true|false to enable/disable automatic expansion of typography types (default: false)

--expandShadow: true|false to enable/disable automatic expansion of boxShadow types (default: false)

--preserveRawValue: true|false to enable/disable addition of a rawValue key containing the unresolved value (default: false)
