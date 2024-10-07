# Automated Releases

For automated releases, `figcd` is used. https://github.com/opral/parrot-figcd

## Instructions

Make sure that app-based MFA/TOTP is enabled for Figma, as it is necessary for publishing plugin releases.

**Creating a Figma authentication token locally**

```sh
npx figcd auth
```

> Enter your Figma email

> Enter your Figma password

> Enter your Figma TOTP token

**Copy and paste the Terminal output**

Example:

```sh
FIGMA_WEB_AUTHN_TOKEN=%7B%2figtkn.123.authn.456%22%7D
```

**Configure the secret on GitHub**

> Repo Settings > Security > Secrets and Variables > Actions > Environment secrets

```sh
FIGMA_WEB_AUTHN_TOKEN
```

### Release Command

```sh
npx figcd release
```


