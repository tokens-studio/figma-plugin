VERSION=figma-tokens@124
sentry-cli releases -p figma-tokens files "$VERSION" upload-sourcemaps --ext ts --ext tsx --ext map --ext js --ignore-file .sentryignore .
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"