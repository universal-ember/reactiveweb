import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';

module('debounce | rendering', function (hooks) {
  setupRenderingTest(hooks);

  const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  test('value is returned *after* delay has passed', async function (assert) {
    class Test {
      @tracked value = 'initial';

      @use debouncedValue = debounce(100, () => this.value);
    }

    const test = new Test();

    setOwner(test, this.owner);

    await render(
      <template>
        <output>{{test.debouncedValue}}</output>
      </template>
    );

    assert.dom('output').hasNoText();
    assert.strictEqual(test.debouncedValue, undefined, 'Value is undefined at first');

    await timeout(25);

    assert.dom('output').hasNoText();
    assert.strictEqual(test.debouncedValue, undefined, 'Value is still undefined after ~25ms');

    // Changing the value resets the debounce timer
    test.value = 'new';

    // not quite enough
    await timeout(80);

    assert.dom('output').hasNoText();
    assert.strictEqual(
      test.debouncedValue,
      undefined,
      `Value is still undefined after ~105ms (because we changed something at ~25ms)`
    );

    await timeout(50);

    assert.dom('output').hasText('new');
    assert.strictEqual(test.debouncedValue, test.value, `Value is "${test.value}" after ~155ms`);

    await timeout(50);

    assert.dom('output').hasText('new');
    assert.strictEqual(test.debouncedValue, test.value, `Value is "${test.value}" after ~205ms`);
  });
});
