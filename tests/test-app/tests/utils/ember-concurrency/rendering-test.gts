/* eslint-disable @typescript-eslint/no-explicit-any */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { render, settled, setupOnerror } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { restartableTask, timeout } from 'ember-concurrency';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { trackedFunction } from 'reactiveweb/function';

let version = '^3.0.0';

module('useTask', function () {
  module('ember-concurrency@v3', function () {
    module('in templates', function (hooks) {
      setupRenderingTest(hooks);

      test('it works', async function (assert) {
        class TestComponent extends Component<{ Blocks: { default: [TestComponent] } }> {
          @tracked input = 'Hello there';

          _search = restartableTask(async (input: string) => {
            await timeout(500);

            return input;
          });

          search = trackedTask(this, this._search, () => [this.input]);

          get result() {
            return `${this.search.value}`;
          }

          <template>{{yield this}}</template>
        }

        render(
          <template>
            <TestComponent as |ctx|>
              {{#if ctx.search.isRunning}}
                Loading
              {{else}}
                {{ctx.result}}
              {{/if}}
            </TestComponent>
          </template>
        );

        // This could introduce flakiness / timing issues
        await timeout(10);

        assert.dom().hasText('Loading');

        await settled();

        assert.dom().hasText('Hello there');
      });
    });
  });

  module(`ember-concurrency's TaskInstance API :: ${version}`, function (hooks) {
    setupRenderingTest(hooks);

    let onError = window.onerror;

    hooks.beforeEach(function () {
      onError = window.onerror;
    });

    hooks.afterEach(function () {
      window.onerror = onError;
    });

    test('is reactively thennable', async function (assert) {
      class Test {
        @tracked input = 'Hello there';

        _search = restartableTask(async (input: string) => {
          await timeout(100);
          assert.step('resolved rt');

          return input;
        });
        search = trackedTask(this, this._search, () => [this.input]);

        wrappedSearch = trackedFunction(this, async () => {
          let result = await this.search;

          assert.step(`tf:${result}`);

          return String(result);
        });
      }

      let ctx = new Test();

      render(<template>{{ctx.wrappedSearch.value}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasNoText();

      await settled();

      assert.dom().hasText('Hello there');
      assert.verifySteps(
        ['resolved rt', 'tf:Hello there', 'tf:Hello there'],
        'tracked function over-dirties due to consuming a task'
      );

      ctx.input = 'General Kenobi';
      await settled();
      assert.dom().hasText('General Kenobi');
      assert.verifySteps(
        ['resolved rt', 'tf:General Kenobi', 'tf:General Kenobi'],
        'tracked function over-dirties due to consuming a task'
      );
    });

    test('error', async function (assert) {
      setupOnerror((error: any) => {
        assert.ok(
          error?.message?.includes('boop'),
          'Errors should be caught in the task and properly dealth with'
        );
      });

      class Test {
        _search = restartableTask(async () => {
          await timeout(100);

          throw new Error('boop');
        });

        search = trackedTask(this, this._search);

        get error() {
          return `${this.search.error}`;
        }
      }

      let ctx = new Test();

      render(<template>{{ctx.error}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('null');

      await settled();

      assert.dom().hasText('Error: boop');
    });

    test('hasStarted', async function (assert) {
      class Test {
        @tracked input = 'Hello there';

        _search = restartableTask(async (input: string) => {
          await timeout(100);

          return input;
        });
        search = trackedTask(this, this._search, () => [this.input]);
      }

      let ctx = new Test();

      render(<template>{{ctx.search.hasStarted}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('true');

      await settled();

      assert.dom().hasText('true');
    });

    test('isCanceled', async function (assert) {
      class Test {
        _search = restartableTask(async () => {
          await timeout(100);

          throw new Error('boop');
        });
        search = trackedTask(this, this._search);
      }

      let ctx = new Test();

      render(<template>{{ctx.search.isCanceled}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('false');

      ctx.search.cancel();

      await settled();

      assert.dom().hasText('true');
    });

    test('isError', async function (assert) {
      class Test {
        _search = restartableTask(async () => {
          await timeout(100);

          throw new Error('boop');
        });
        search = trackedTask(this, this._search);
      }

      let ctx = new Test();

      render(<template>{{ctx.search.isError}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('false');

      await settled();

      assert.dom().hasText('true');
    });

    test('isFinished', async function (assert) {
      class Test {
        @tracked input = 'Hello there';

        _search = restartableTask(async (input: string) => {
          await timeout(100);

          return input;
        });
        search = trackedTask(this, this._search, () => [this.input]);
      }

      let ctx = new Test();

      render(<template>{{ctx.search.isFinished}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('false');

      await settled();

      assert.dom().hasText('true');
    });

    test('isSuccessful', async function (assert) {
      class Test {
        @tracked input = 'Hello there';

        _search = restartableTask(async (input: string) => {
          await timeout(100);

          return input;
        });
        search = trackedTask(this, this._search, () => [this.input]);
      }

      let ctx = new Test();

      render(<template>{{ctx.search.isSuccessful}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasText('false');

      await settled();

      assert.dom().hasText('true');
    });

    test('value', async function (assert) {
      class Test {
        @tracked input = 'Hello there';

        _search = restartableTask(async (input: string) => {
          await timeout(100);

          return input;
        });
        search = trackedTask(this, this._search, () => [this.input]);

        get result() {
          return `${this.search.value || ''}`;
        }
      }

      let ctx = new Test();

      render(<template>{{ctx.result}}</template>);

      // This could introduce flakiness / timing issues
      await timeout(10);

      assert.dom().hasNoText();

      await settled();

      assert.dom().hasText('Hello there');
    });
  });
});
