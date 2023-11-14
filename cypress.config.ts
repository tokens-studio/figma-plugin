import { defineConfig } from 'cypress'

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
      return require('./cypress/plugins/index.js')(on, config)
    },
    baseUrl: 'http://localhost:61968',
  },
})
