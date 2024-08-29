import * as QUnit from 'qunit';

import { http } from 'msw';
import { setupWorker } from 'msw/browser';

let worker: ReturnType<typeof setupWorker>;

/**
 * Setup worker before any test begins so that we don't introduce
 * any potential instabilities due to "sometimes" making a test
 * run longer by lazily setting up the work for the first test
 * that uses `setupMSW`
 */
QUnit.begin(async () => {
  worker = setupWorker();

  /**
   * At this point we have no request handlers, but that's what
   * setupMSW is for
   */
  // await worker.start();
});

QUnit.done(async () => {
  worker?.stop();
});

export async function setupMSW(
  hooks: NestedHooks,
  handlers: (args: { http: typeof http }) => Parameters<(typeof worker)['use']>
) {
  hooks.beforeEach(async function () {
    await worker.start();
    worker.use(...handlers({ http }));
  });

  hooks.afterEach(function () {
    /**
     * Ensure that we clean up after ourselves
     */
    worker?.stop();
  });
}
