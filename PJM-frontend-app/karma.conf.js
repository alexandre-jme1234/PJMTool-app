// Karma configuration file
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    files: [
      'src/test-setup.ts'
    ],
    client: {
      jasmine: {
        // Options Jasmine
      },
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/pjm-frontend-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },      // Rapport HTML interactif
        { type: 'text-summary' }, // Résumé dans la console
        { type: 'lcov' },      // Format pour SonarQube/Codecov
        { type: 'json' }       // Format JSON
      ],
      check: {
        global: {
          statements: 50,
          branches: 50,
          functions: 50,
          lines: 50
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    restartOnFileChange: true,
    browserNoActivityTimeout: 60000,
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    captureTimeout: 210000,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-software-rasterizer']
      }
    },
    browsers: ['ChromeHeadlessNoSandbox']
  });
};
