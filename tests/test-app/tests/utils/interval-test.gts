import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { find, render } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell, use } from 'ember-resources';
import { Duration, Interval, Seconds } from 'reactiveweb/interval';

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module('Interval | js', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    class Test extends Component {
      @tracked foo = 1;
      @use value = Interval(50, {
        create: () => this.foo,
        update: (x) => (this.foo = x * 3),
        read: (x) => x,
      });

      <template>{{this.value}}</template>
    }

    await render(Test);
    assert.dom().hasText('1');

    await timeout(75);
    assert.dom().hasText('3');

    await timeout(50);
    assert.dom().hasText('9');
  });
});

module('Interval | rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    const config = {
      create: () => cell('hello'),
      update: (x: ReturnType<typeof cell<string>>) => (x.current += '!'),
      read: (x: ReturnType<typeof cell<string>>) => x.current,
    };

    await render(<template>{{Interval 50 config}}</template>);

    assert.dom().hasText('hello');
    await timeout(75);

    assert.dom().hasText('hello!');

    await timeout(50);
    assert.dom().hasText('hello!!');
  });
});

module('Seconds | js', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    class Test extends Component {
      @use value = Seconds();

      <template>{{this.value}}</template>
    }

    await render(Test);
    assert.dom().hasText('0');

    await timeout(1050);
    assert.dom().hasText('1');
  });
});

module('Seconds | rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    await render(<template>{{Seconds}}</template>);

    assert.dom().hasText('0');

    await timeout(1050);
    assert.dom().hasText('1');
  });
});

module('Duration | js', function (hooks) {
  setupRenderingTest(hooks);

  const text = () => find('out')?.textContent;

  test('it works', async function (assert) {
    class Test extends Component {
      @use value = Duration(10);

      <template>
        <out>{{this.value}}</out>
      </template>
    }

    await render(Test);
    assert.strictEqual(text(), '0', `expecting ${text()} to be 0`);

    await timeout(150);
    assert.notStrictEqual(text(), '0', `expecting ${text()} not to be 0`);
  });
});

module('Duration | rendering', function (hooks) {
  setupRenderingTest(hooks);

  const text = () => find('out')?.textContent;

  test('it works', async function (assert) {
    await render(
      <template>
        <out>{{Duration 10}}</out>
      </template>
    );

    assert.strictEqual(text(), '0', `expecting ${text()} to be 0`);

    await timeout(150);
    assert.notStrictEqual(text(), '0', `expecting ${text()} not to be 0`);
  });
});
