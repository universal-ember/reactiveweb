import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';

module('Utils | debounce | js', function (hooks) {
  setupTest(hooks);

  const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  module('debounce', function () {
    test('value is returned after x ms', async function (assert) {
      class Test {
        @tracked value = 'initial';

        @use debouncedValue = debounce(100, () => this.value);
      }

      let test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.debouncedValue, undefined, 'Value is undefined at first');

      await timeout(50);

      assert.strictEqual(test.debouncedValue, undefined, 'Value is still undefined after ~50ms');

      await timeout(50);

      assert.strictEqual(test.debouncedValue, test.value, `Value is "${test.debouncedValue}" after ~100ms`);
    });

    test('value is returned x ms after latest change', async function (assert) {
      class Test {
        @tracked value = 'initial';

        @use debouncedValue = debounce(100, () => this.value);
      }

      let test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.debouncedValue, undefined, 'Value is undefined at first');

      await timeout(50);

      assert.strictEqual(test.debouncedValue, undefined, 'Value is still undefined after ~50ms');

      // Changing the value resets the debounce timer
      test.value = 'new';

      await timeout(50);

      assert.strictEqual(test.debouncedValue, undefined, `Value is still undefined after ~100ms (because we changed something at ~50ms)`);

      await timeout(50);

      assert.strictEqual(test.debouncedValue, test.value, `Value is "${test.value}" after ~150ms`);

      await timeout(50);

      assert.strictEqual(test.debouncedValue, test.value, `Value is "${test.value}" after ~200ms`);
    });
  });
});
