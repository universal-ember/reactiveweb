import Application from '@ember/application';
import { importSync, isDevelopingApp, macroCondition } from '@embroider/macros';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';
import config from "./config/environment";

import compatModules from "@embroider/virtual/compat-modules";

if (macroCondition(isDevelopingApp())) {
  importSync('test-app/deprecation-workflow');
}

export default class App extends Application {
  modulePrefix = config.modulePrefix;
  podModulePrefix = config.podModulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(App, config.modulePrefix, compatModules);
