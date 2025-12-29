# Creating a release

Release generation should be automated in the GitHub workflow, however if a manual release is necessary, the steps are outlined below.

## Prerequisites

In order to release a new version, first make sure you have the correct `.env` variables setup. There are `env.example` & `.env.production.example` files available at the root of the package.

**Important**: You'll need to provide the `SENTRY_AUTH_TOKEN` in `.env` as that's where the script is looking for it.

### `.env.production`

```
MIXPANEL_ACCESS_TOKEN=INSERT_MIXPANEL_ACCESS_TOKEN
ENVIRONMENT=production
LICENSE_API_URL=https://figmatokens-api.herokuapp.com
LAUNCHDARKLY_SDK_CLIENT=626fb05d52e5c715abd11b5e
```

### `.env`

```
SENTRY_AUTH_TOKEN=INSERT_SENTRY_TOKEN
```

## Bundling the files

Make sure that `package.json` contains the correct version number in the field `version` (for example `1.12.23`).
Then, to create the necessary bundle, run `yarn build` followed by `yarn bundle` to automatically create the release bundle in `./dist/bundle.zip`.

## Launching in Figma

Once that is done, launch the plugin in Figma. Check if the version number is correct and that the plugin is running smooth.

Then you'll need to go to `Plugins` -> `Development` -> `Manage plugins in development`. Click on Tokens Studio and choose `Publish a new release`.

## Creating a Sentry release

Sentry releases should be handled automatically during the build process. Just make sure the following variables are exposed during the build process

- `SENTRY_ORG` - The env var with our sentry organization
- `SENTRY_PROJECT` - The env var with the sentry project id
- `SENTRY_AUTH_TOKEN` - The auth token to interact with Sentry
- `SENTRY_DSN` - The DSN to use for Sentry
- `SENTRY_SAMPLING` - The amount of general error sampling to do
- `SENTRY_PROFILE_SAMPLING` - The amount of profling sampling to do
- `SENTRY_REPLAY_SAMPLING` - The amount of replay sampling to do
