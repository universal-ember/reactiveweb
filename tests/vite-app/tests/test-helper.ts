import { getSettledState, resetOnerror, setApplication } from '@ember/test-helpers';
import { getPendingWaiterState, getWaiters } from '@ember/test-waiters';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start as qunitStart } from 'ember-qunit';

import Application from 'vite-app/app';
import config from 'vite-app/config/environment';

export function start() {
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);

  Object.assign(window, { getPendingWaiterState, getWaiters, getSettledState });

  QUnit.config.testTimeout = 8000;

  QUnit.testDone(function () {
    resetOnerror();
  });

  // Prevent global Errors from breaking tests
  window.onerror = console.error;

  qunitStart();
}
