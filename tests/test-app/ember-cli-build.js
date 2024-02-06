'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  let babel = {};

  if (process.env.EMBER_TRY_CURRENT_SCENARIO === 'ember-concurrency-4.0') {
    babel = {
      plugins: [
        // ... any other plugins
        require.resolve('ember-concurrency/async-arrow-task-transform'),

        // NOTE: put any code coverage plugins last, after the transform.
      ],
    };
  }

  let app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    babel,
    autoImport: {
      watchDependencies: ['reactiveweb'],
    },
  });

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [],
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    splitControllers: true,
    splitRouteClasses: true,
    implicitModulesStrategy: 'packageNames',
    packagerOptions: {
      webpackConfig: {
        devtool: 'source-map',
      },
    },
  });
};
