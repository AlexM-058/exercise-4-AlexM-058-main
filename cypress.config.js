const { defineConfig } = require('cypress')

module.exports = defineConfig({
  chromeWebSecurity: false,
  e2e: {
    supportFile: false,
    baseUrl: 'http://localhost:3000', 
    video: false,
    setupNodeEvents(on, config) {},
  },
})
