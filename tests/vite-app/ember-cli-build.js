'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const { compatBuild } = require('@embroider/compat');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  let babel = {};

  if (process.env.EMBER_TRY_CURRENT_SCENARIO === 'ember-concurrency-4.0') {
    babel = {
      plugins: [
        // eslint-disable-next-line n/no-missing-require
        require.resolve('ember-concurrency/async-arrow-task-transform'),

        // NOTE: put any code coverage plugins last, after the transform.
      ],
    };
  }

  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    babel,
    autoImport: {
      watchDependencies: ['reactiveweb'],
    },
  });

  return compatBuild(app, buildOnce, {
    extraPublicTrees: [],
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
      },
    },
  });
};
