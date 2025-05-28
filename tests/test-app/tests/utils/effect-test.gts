import { fn } from '@ember/helper';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell } from 'ember-resources';
import { effect, renderEffect } from 'reactiveweb/effect';

module('effect', function (hooks) {
  setupRenderingTest(hooks);

  test('it runs once', async function (assert) {
    const doThis = () => assert.step('did it');

    await render(<template>{{effect doThis}}</template>);

    assert.verifySteps(['did it']);
  });

  test('it can autotrack', async function (assert) {
    const value = cell(0);

    const doThis = (num: { current: number }) => assert.step(`did it:${num.current}`);

    await render(<template>{{effect (fn doThis value)}}</template>);

    assert.verifySteps(['did it:0']);

    value.current++;
    await settled();
    assert.verifySteps(['did it:1']);
  });
});

module('renderEffect', function (hooks) {
  setupRenderingTest(hooks);

  test('it runs once', async function (assert) {
    const doThis = () => assert.step('did it');

    await render(<template>{{renderEffect doThis}}</template>);

    assert.verifySteps(['did it']);
  });

  test('it can autotrack', async function (assert) {
    const value = cell(0);

    const doThis = (num: { current: number }) => assert.step(`did it:${num.current}`);

    await render(<template>{{renderEffect (fn doThis value)}}</template>);

    assert.verifySteps(['did it:0']);

    value.current++;
    await settled();
    assert.verifySteps(['did it:1']);
  });
});
