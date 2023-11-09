'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    usePnpm: true,
    buildManagerOptions() {
      return ['--ignore-scripts', '--no-frozen-lockfile'];
    },
    scenarios: [
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
            // Newer versions require ember-source@4.8+
            // We depend on latest ember-async-data
            // so that our types can pass.
            'ember-async-data': '0.7.1',
            // This is needed until ember-source @ 4.5,
            // when the functions are supported as helpers
            'ember-functions-as-helper-polyfill': '2.1.2',
            // for compatibility with ember-qunit
            'ember-cli': '~4.12.1',
          },
        },
      },
      {
        name: 'ember-lts-4.8',
        npm: {
          devDependencies: {
            'ember-source': '~4.8.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
    ],
  };
};
