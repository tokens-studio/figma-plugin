## v0.0.16 (2022-01-13)

Hotfix for v0.0.15

## v0.0.15 (2022-01-13)

This version makes the behavior that expands typography optional and actually treats expanding as an opt-in choice. Thanks @jeffreydelooff!

### CHANGES
* Introduced --expandTypography: true|false to enable/disable automatic expansion of typography types (default: false)

### BREAKING CHANGES

* If you want your typography to be expanded to single values you need to use --expandTypography=true from now on. E.g. `node token-transformer input.json output.json --expandTypography=false`