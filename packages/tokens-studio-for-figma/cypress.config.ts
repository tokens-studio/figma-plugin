import { defineConfig } from 'cypress';

export default defineConfig({
  chromeWebSecurity: false,
  env: {
    'cypress-react-selector': {
      root: '#app',
    },
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // Figure out if we can use ESM file for this or remove it
      // since we don't actually use any plugins in this plugins entry file
      // eslint-disable-next-line global-require
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://localhost:58630',
  },
});
