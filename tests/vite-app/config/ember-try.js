'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    usePnpm: true,
    // Build and test the same way as the `test:ember` script.
    command: 'pnpm test:ember',
    buildManagerOptions() {
      return ['--ignore-scripts', '--no-frozen-lockfile'];
    },
    scenarios: [
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
        name: 'ember-concurrency-4.0',
        npm: {
          dependencies: {
            'ember-concurrency': '^4.0.0',
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
        name: 'ember-lts-5.8',
        npm: {
          devDependencies: {
            'ember-source': '~5.8.0',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12.0',
          },
        },
      },
      {
        name: 'ember-lts-6.4',
        npm: {
          devDependencies: {
            'ember-source': '~6.4.0',
          },
        },
      },
      {
        name: 'ember-lts-6.8',
        npm: {
          devDependencies: {
            'ember-source': '~6.8.0',
          },
        },
      },
      {
        name: 'ember-lts-6.12',
        npm: {
          devDependencies: {
            'ember-source': '~6.12.0',
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
