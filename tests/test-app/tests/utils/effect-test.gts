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

    const doThis = (num: number) => assert.step(`did it:${num}`);

    await render(<template>{{effect doThis value.current}}</template>);

    assert.verifySteps(['did it:0']);

    value.current++;
    await settled();
    assert.verifySteps(['did it:1']);
  });

  test('arg types are correct', async function (assert) {
    function doThis(a: number, b: string) {
      // eslint-disable-next-line
      console.log(a, b);
    }

    await render(
      <template>
        {{effect doThis 1 "2"}}
        {{effect (fn doThis 1 "2")}}
      </template>
    );
    assert.ok(true, 'testing types, not behavior here');
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

    const doThis = (num: number) => assert.step(`did it:${num}`);

    await render(<template>{{renderEffect doThis value.current}}</template>);

    assert.verifySteps(['did it:0']);

    value.current++;
    await settled();
    assert.verifySteps(['did it:1']);
  });

  test('arg types are correct', async function (assert) {
    function doThis(a: number, b: string) {
      // eslint-disable-next-line
      console.log(a, b);
    }

    await render(
      <template>
        {{renderEffect doThis 1 "2"}}
        {{renderEffect (fn doThis 1 "2")}}
      </template>
    );
    assert.ok(true, 'testing types, not behavior here');
  });
});
