# Creating a release

## Prerequisites

In order to release a new version, first make sure you have the correct `.env` variables setup.
Important: You'll need to provide the `SENTRY_AUTH_TOKEN` in `.env` as that's where the script is looking for it.


`.env.production`

MIXPANEL_ACCESS_TOKEN=INSERT_MIXPANEL_ACCESS_TOKEN
STORYBLOK_ACCESS_TOKEN=INSERT_STORYBLOK_ACCESS_TOKEN
ENVIRONMENT=production
LICENSE_API_URL=https://figmatokens-api.herokuapp.com
LAUNCHDARKLY_SDK_CLIENT=626fb05d52e5c715abd11b5e

`.env`
SENTRY_AUTH_TOKEN=INSERT_SENTRY_TOKEN
## Bundling the files

Make sure that package.json contains the correct version number in the field `plugin_version`, for example 112.
Then, to create the necessary bundle, run `yarn build`.

## Launching in Figma

Once that is done, launch the plugin in Figma once. Check if the version number is correct and that the plugin is running smooth.

Then you'll need to go to `Manage plugins in development`.
Click on Tokens Studio and choose `Publish a new release`

## Creating a Sentry release

In order to provide source maps for Sentry, we need to publish a release everytime we publish a release in Figma.

To do that, change the VERSION constant of the `script/release.sh` script to match the version that you're publishing (eg 112). 

Once that is done and the plugin is published, you can run `script/release.sh`. 

If that gives you an error, make sure that the file has the required permissions, e.g. `chmod …`

The script basically does the following:

VERSION=VERSION_NUMBER
sentry-cli releases new "$VERSION"
sentry-cli releases -p figma-tokens files "$VERSION" upload-sourcemaps --ext ts --ext tsx --ext map --ext js --ignore-file .sentryignore .
sentry-cli releases finalize "$VERSION"
