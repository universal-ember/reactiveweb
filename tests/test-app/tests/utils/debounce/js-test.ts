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

      assert.strictEqual(
        test.debouncedValue,
        test.value,
        `Value is "${test.debouncedValue}" after ~100ms`
      );
    });

    test('initialize value', async function (assert) {
      class Test {
        @tracked data = 'start';

        @use text = debounce(100, () => this.data, this.data);
      }

      let test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.text, 'start');

      test.data = 'b';
      await someTime();
      assert.strictEqual(test.text, 'start');
      test.data = 'bo';
      await someTime();
      assert.strictEqual(test.text, 'start');
      test.data = 'boo';
      await someTime();
      assert.strictEqual(test.text, 'start');

      await someTime(110);
      assert.strictEqual(test.text, 'boo');

      test.data = 'boop';
      assert.strictEqual(test.text, 'boo');

      await someTime(110);
      assert.strictEqual(test.text, 'boop');
    });
  });
});
