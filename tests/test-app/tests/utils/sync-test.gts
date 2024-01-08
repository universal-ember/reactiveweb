import { fn } from '@ember/helper';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell } from 'ember-resources';
import { sync } from 'reactiveweb/sync';

module('sync', function (hooks) {
  setupRenderingTest(hooks);

  test('it runs once', async function (assert) {
    const doThis = () => assert.step('did it');

    await render(
      <template>
        {{sync doThis}}
      </template>
    );

    assert.verifySteps(['did it']);
  });

  test('it can autotrack', async function (assert) {
    const value = cell(0);

    const doThis = (num: { current: number }) => assert.step(`did it:${num.current}`);

    await render(
      <template>
        {{sync (fn doThis value)}}
      </template>
    );

    assert.verifySteps(['did it:0']);

    value.current++;
    await settled();
    assert.verifySteps(['did it:1']);
  });
});
