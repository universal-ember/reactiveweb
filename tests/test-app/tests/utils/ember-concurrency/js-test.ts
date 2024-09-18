/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tracked } from '@glimmer/tracking';
import { settled } from '@ember/test-helpers';
import { waitForPromise } from '@ember/test-waiters';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { trackedTask } from 'reactiveweb/ember-concurrency';

module('useTask', function () {
  module('ember-concurrency@v3', function () {
    module('in JS', function (hooks) {
      setupTest(hooks);

      test('it works', async function (assert) {
        class Test {
          @tracked input = '';

          _search = restartableTask(async (input: string) => {
            // or some bigger timeout for an actual search task to debounce
            await timeout(0);

            // or some api data if actual search task
            return { results: [input] };
          });

          search = trackedTask(this, this._search, () => [this.input]);
        }

        let foo = new Test();

        // task is initiated upon first access
        foo.search;
        await settled();

        assert.strictEqual(foo.search.value, undefined);
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: [''] });

        foo.input = 'Hello there!';
        await settled();

        assert.deepEqual(foo.search.value, { results: [''] }, 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: ['Hello there!'] });
      });

      test('it works without the thunk', async function (assert) {
        class Test {
          @tracked input = '';

          _search = restartableTask(async () => {
            // NOTE: args must be consumed before the first yield
            let { input } = this;

            // or some bigger timeout for an actual search task to debounce
            await timeout(0);

            // or some api data if actual search task
            return { results: [input] };
          });

          search = trackedTask(this, this._search);
        }

        let foo = new Test();

        // task is initiated upon first access
        foo.search;
        await settled();

        assert.strictEqual(foo.search.value, undefined);
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: [''] });

        foo.input = 'Hello there!';
        await settled();

        assert.deepEqual(foo.search.value, { results: [''] }, 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: ['Hello there!'] });
      });

      test('it returns correct task value if "task" function returned "undefined" or "null"', async function (assert) {
        class Test {
          @tracked input: string | undefined | null = 'initial value';

          _search = restartableTask(async (input: string | undefined | null) => {
            // or some bigger timeout for an actual search task to debounce
            await timeout(0);

            // or some api data if actual search task
            return input;
          });

          search = trackedTask(this, this._search, () => [this.input]);
        }

        let foo = new Test();

        // task is initiated upon first access
        foo.search;
        await settled();

        assert.strictEqual(foo.search.value, undefined);
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.strictEqual(foo.search.value, 'initial value');

        // "trackedTask" must return "undefined" as current (latest) value
        foo.input = undefined;
        await settled();

        assert.strictEqual(foo.search.value, 'initial value', 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.strictEqual(foo.search.value, undefined);

        // "trackedTask" must return "null" as current (latest) value
        foo.input = null;
        await settled();

        assert.strictEqual(foo.search.value, undefined, 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.strictEqual(foo.search.value, null);
      });

      test('it returns correct task value when tasks have been dropped', async function (assert) {
        class Test {
          @tracked input = 'initial value';

          _search = dropTask(async (input: string) => {
            await waitForPromise(new Promise((resolve) => setTimeout(() => resolve(''))));

            return input;
          });

          search = trackedTask(this, this._search, () => [this.input]);
        }

        let foo = new Test();

        // task is initiated upon first access
        foo.search.value;

        // immediately start another task (this will be dropped/cancelled)
        foo.input = 'updated value';
        foo.search.value;

        await settled();

        assert.strictEqual(foo.search.value, 'initial value', 'returns value from first task');
        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
      });

      test('it runs again when calling retry()', async function (assert) {
        class Test {
          @tracked input = '';

          counter = 0;

          _search = restartableTask(async (input: string) => {
            // or some bigger timeout for an actual search task to debounce
            await timeout(0);

            this.counter++;

            // or some api data if actual search task
            return { results: [input, this.counter] };
          });

          search = trackedTask(this, this._search, () => [this.input]);
        }

        let foo = new Test();

        // task is initiated upon first access
        foo.search;
        await settled();


        assert.strictEqual(foo.search.value, undefined);
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: ['', 1] });
        assert.strictEqual(foo._search.performCount, 1, 'Task was performed once');

        foo.input = 'Hello there!';
        await settled();

        assert.deepEqual(foo.search.value, { results: ['', 1] }, 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();

        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: ['Hello there!', 2] });
        assert.strictEqual(foo._search.performCount, 2, 'Task was performed twice');


        foo.search.retry();

        assert.deepEqual(foo.search.value, { results: ['Hello there!', 2] }, 'previous value is retained');
        assert.false(foo.search.isFinished);
        assert.true(foo.search.isRunning);

        await settled();
        assert.true(foo.search.isFinished);
        assert.false(foo.search.isRunning);
        assert.deepEqual(foo.search.value, { results: ['Hello there!', 3] });

        assert.strictEqual(foo._search.performCount, 3, 'Task was performed three times');
      });
    });
  });
});
