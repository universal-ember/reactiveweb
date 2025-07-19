import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { getPromiseState, type State } from 'reactiveweb/get-promise-state';

import type QUnit from 'qunit';

module('getPromiseState', function (hooks) {
  setupRenderingTest(hooks);

  module('state transitions', function () {
    async function stateStepper(state: State, assert: QUnit['assert']) {
      let step = (msg: string) => assert.step(msg);

      await render(
        <template>
          {{#if state.isLoading}}{{step "loading"}}{{/if}}
          {{#if state.error}}{{step "error"}}{{/if}}
          {{#if state.resolved}}{{step "resolved"}}{{/if}}
        </template>
      );
    }

    test('handles value', async function (assert) {
      let state = getPromiseState('hello');

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state, { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles Promise (state created outside template)', async function (assert) {
      let state = getPromiseState(Promise.resolve('hello'));

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles Promise (state created inside template)', async function (assert) {
      let promiseValue = Promise.resolve('hello');

      let step = (msg: string) => assert.step(msg);

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
      let state = getPromiseState(() => 'hello');

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles async function', async function (assert) {
      let state = getPromiseState(async () => Promise.resolve('hello'));

      await stateStepper(state, assert);

      assert.verifySteps(['resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });

    test('handles async function (with delay)', async function (assert) {
      let state = getPromiseState(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));

        return 'hello';
      });

      await stateStepper(state, assert);

      assert.verifySteps(['loading', 'resolved']);
      assert.deepEqual(state.toJSON(), { isLoading: false, error: null, resolved: 'hello' });
    });
  });
});
