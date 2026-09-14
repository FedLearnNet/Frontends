import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/integration/**/*.spec.ts',
    supportFile: 'cypress/support/e2e.ts',
    // Clean up old screenshots/videos before a run
    trashAssetsBeforeRuns: true,

    // Enable video recording of every spec
    video: true,

    // Where to drop videos & screenshots
    videosFolder: 'results/videos',
    screenshotsFolder: 'results/screenshots',
    screenshotOnRunFailure: true,

    // Use mocha-multi-reporters (configured via reporter-config.json)
    reporter: 'mocha-multi-reporters',
    reporterOptions: {
      configFile: 'reporter-config.json'
    },

    setupNodeEvents(on, config) {
      // Example task:
      on('task', {
        resetDb() {
          console.log('Resetting and seeding DB...');
          return null;
        }
      });
      return config;
    }
  }
});


