VERSION=112.rc-3
sentry-cli releases new "$VERSION"
sentry-cli releases -p figma-tokens files "$VERSION" upload-sourcemaps --ext ts --ext tsx --ext map --ext js --ignore-file .sentryignore .
