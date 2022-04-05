## v0.0.20 (2022-04-02)

Added expandShadow option (thanks @iShavgula-TacTill)
Added option to specify a directory of .json files, simply specify the folder name, instead of e.g. input.json

## v0.0.19 (2022-02-24)

Changed expandTypography to include the key as a token type so users could transform these accordingly with style dictionary.

## v0.0.18 (2022-02-20)

Adds --preserveRawValue: true|false which allows you to add a `rawValue` prop on each token containing the unresolved value. Thanks @zephraph!

## v0.0.17 (2022-01-20)

Hotfix for v0.0.16

## v0.0.16 (2022-01-13)

Hotfix for v0.0.15

## v0.0.15 (2022-01-13)

This version makes the behavior that expands typography optional and actually treats expanding as an opt-in choice. Thanks @jeffreydelooff!

### CHANGES
* Introduced --expandTypography: true|false to enable/disable automatic expansion of typography types (default: false)

### BREAKING CHANGES

* If you want your typography to be expanded to single values you need to use --expandTypography=true from now on. E.g. `node token-transformer input.json output.json --expandTypography=false`