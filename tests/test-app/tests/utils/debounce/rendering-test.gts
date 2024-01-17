import { tracked } from '@glimmer/tracking';
import { render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { use } from 'ember-resources';
import { debounce } from 'reactiveweb/debounce';

module('Utils | debounce | rendering', function (hooks) {
  setupRenderingTest(hooks);

  let someTime = (ms = 25) => new Promise((resolve) => setTimeout(resolve, ms));

  module('debounce', function () {
    test('without debouncing the initial value', async function (assert) {
      class Test {
        @tracked text = 'someValue';
        @use debouncedText = debounce(100, () => this.text, false);
      }

      let foo = new Test();

      await render(<template>
        {{foo.debouncedText}}
        </template>);

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
