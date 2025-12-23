import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest, setupTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { throttle } from 'reactiveweb/throttle';

module('Utils | throttle | js', function (hooks) {
  setupTest(hooks);

  const someTime = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));

  module('throttle', function () {
    test('works with @use', async function (assert) {
      class Test {
        @tracked data = '';

        @use text = throttle(100, () => this.data);
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.text, '');

      test.data = 'b';
      await someTime();
      assert.strictEqual(test.text, '');
      test.data = 'bo';
      await someTime();
      assert.strictEqual(test.text, '');
      test.data = 'boo';
      await someTime();
      assert.strictEqual(test.text, '');

      await someTime(110);
      assert.strictEqual(test.text, 'boo');

      test.data = 'boop';
      assert.strictEqual(test.text, 'boo');

      await someTime(110);
      assert.strictEqual(test.text, 'boop');
    });
  });
});

module('Utils | throttle | rendering', function (hooks) {
  setupRenderingTest(hooks);

  const someTime = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));

  module('debounce', function () {
    test('without debouncing the initial value', async function (assert) {
      class Test {
        @tracked text = 'someValue';
        @use debouncedText = throttle(100, () => this.text);
      }

      const foo = new Test();

      await render(<template>{{foo.debouncedText}}</template>);

      assert.dom().hasText('someValue');

      foo.text = 'newValue';

      // Change is not inmediately reflected
      assert.dom().hasText('someValue');

      // Change is also not reflected after 50ms
      await someTime(50);
      assert.dom().hasText('someValue');

      // Change is reflected after 100ms (50+50)
      await someTime(50);
      assert.dom().hasText('newValue');
    });
  });
});
