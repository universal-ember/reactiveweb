import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell } from 'ember-resources';
import {
  getPromiseState,
  REASON_FUNCTION_EXCEPTION,
  REASON_PROMISE_REJECTION,
  type State,
} from 'reactiveweb/get-promise-state';

import type QUnit from 'qunit';

module('getPromiseState', function (hooks) {
  setupRenderingTest(hooks);

  module('state', function () {
    async function stateStepper(state: State<unknown>, assert: QUnit['assert']) {
      const step = (msg: string) => assert.step(msg);

      await render(
        <template>
          {{#if state.isLoading}}{{step "loading"}}{{/if}}
          {{#if state.error}}{{step "error"}}{{/if}}
          {{#if state.resolved}}{{step "resolved"}}{{/if}}
        </template>
      );
    }

    test('handles value', async function (assert) {
      const state = getPromiseState('hello');

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles Promise (state created outside template)', async function (assert) {
      const state = getPromiseState(Promise.resolve('hello'));

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles Promise (state created inside template)', async function (assert) {
      const promiseValue = Promise.resolve('hello');

      const step = (msg: string) => assert.step(msg);

      await render(
        <template>
          {{#let (getPromiseState promiseValue) as |state|}}
            {{#if state.isLoading}}{{step "loading"}}{{/if}}
            {{#if state.error}}{{step "error"}}{{/if}}
            {{#if state.resolved}}{{step "resolved"}}{{/if}}
          {{/let}}
        </template>
      );

      assert.verifySteps(['loading', 'resolved']);
    });

    test('handles sync function', async function (assert) {
      const state = getPromiseState(() => 'hello');

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles async function', async function (assert) {
      const state = getPromiseState(async () => Promise.resolve('hello'));

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles async function (with delay)', async function (assert) {
      const state = getPromiseState(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'hello';
      });

      await stateStepper(state, assert);

      assert.verifySteps(['loading', 'resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    module('dedupe', function () {
      test('async () => string', async function (assert) {
        const fun = async () => {
          await Promise.resolve();

          return 'hello';
        };
        const step = (msg: string) => assert.step(msg);
        const second = cell(false);

        await render(
          <template>
            {{#let (getPromiseState fun) as |state|}}
              {{#if state.isLoading}}{{step "loading"}}{{/if}}
              {{#if state.error}}{{step "error"}}{{/if}}
              {{#if state.resolved}}{{step "resolved"}}{{/if}}
            {{/let}}

            {{#if second.current}}
              {{#let (getPromiseState fun) as |state|}}
                {{#if state.isLoading}}{{step "loading"}}{{/if}}
                {{#if state.error}}{{step "error"}}{{/if}}
                {{#if state.resolved}}{{step "resolved"}}{{/if}}
              {{/let}}
            {{/if}}
          </template>
        );

        assert.verifySteps(['loading', 'resolved']);

        second.current = true;
        await settled();

        assert.verifySteps(['resolved']);
      });
    });

    module('errors', function () {
      test('Promise.reject', async function (assert) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        const state = getPromiseState(Promise.reject('hello'));

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: 'hello', reason: REASON_PROMISE_REJECTION },
          resolved: undefined,
        });
      });

      test('() => Promise.reject', async function (assert) {
        // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
        const state = getPromiseState(() => Promise.reject('hello'));

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: 'hello', reason: REASON_PROMISE_REJECTION },
          resolved: undefined,
        });
      });

      test('() => throw (string)', async function (assert) {
        const state = getPromiseState(() => {
          // eslint-disable-next-line @typescript-eslint/only-throw-error
          throw 'hello';
        });

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: 'hello', reason: REASON_FUNCTION_EXCEPTION },
          resolved: undefined,
        });
      });

      test('() => throw (Error)', async function (assert) {
        const state = getPromiseState(() => {
          throw new Error('hello');
        });

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: new Error('hello'), reason: REASON_FUNCTION_EXCEPTION },
          resolved: undefined,
        });
      });

      test('async () => throw (Error)', async function (assert) {
        const state = getPromiseState(async () => {
          await Promise.resolve();
          throw new Error('hello');
        });

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: new Error('hello'), reason: REASON_PROMISE_REJECTION },
          resolved: undefined,
        });
      });

      test('async () => Promise.reject', async function (assert) {
        const state = getPromiseState(async () => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          return await Promise.reject('hello');
        });

        await stateStepper(state, assert);

        assert.verifySteps(['error']);
        assert.deepEqual(state.toJSON(), {
          isLoading: false,
          error: { original: 'hello', reason: REASON_PROMISE_REJECTION },
          resolved: undefined,
        });
      });
    });
  });
});
