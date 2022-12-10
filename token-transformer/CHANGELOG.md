## v0.0.28 (2022-12-01)

Fixed expanded composition token types using the wrong key, those are now using the token types we use in the plugin (fontFamilies, fontWeights). Thanks thomasmattheussen!
We now respect the order of themes as defined in $metadata.json (or the $metadata key). Thanks thomasmattheussen!

## v0.0.27 (2022-09-15)

Added support to read $themes.json or $themes key by using --theme=true - this allows you to generate token files easily by providing a $themes key instead of manually running token-transformer multiple times. Thanks forceofseth!

## v0.0.26 (2022-09-08)

Fixes a crash when other file types than .json are present in the source folder. Thanks thomasmattheussen!

## v0.0.25 (2022-08-13)

Adds support for expanding composition tokens

## v0.0.24 (2022-06-27)

Adds support for shadow tokens that reference other shadow tokens
Adds support for typography tokens that reference other typography tokens
Adds support for composition tokens

## v0.0.23 (2022-05-24)

Shadow and typography tokens now respect the resolveReferences option (thanks @jakobe)

## v0.0.22 (2022-05-06)

Fixed a bug that got introduced in 0.0.21 affecting multiple sets
## v0.0.21 (2022-04-29)

Added throwErrorWhenNotResolved (thanks @borbit)
Added resolveReferences option (thanks @jakobe)

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