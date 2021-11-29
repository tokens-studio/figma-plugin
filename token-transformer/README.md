# Token Transformer

Converts tokens from Figma Tokens to something Style Dictionary can read, removing any math operations or aliases, only resulting in raw values.

## How to use
Install (either globally or local)
`npm install token-transformer -g`

`node token-transformer input output sets excludes`

`node token-transformer input.json output.json global,dark,components global`

## Parameters
Input: Filename of input

Output: Filename of output

Sets: Sets to be used, comma-seperated

Excludes: Sets that should not be part of the export (e.g. a global color scale)