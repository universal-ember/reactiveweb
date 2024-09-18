/** eslint-disable no-console */
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { on } from '@ember/modifier';
import { click, render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { modifier } from 'ember-modifier';
import { resource, resourceFactory, use } from 'ember-resources';
import { trackedFunction } from 'reactiveweb/function';

const timeout = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

module('Utils | trackedFunction | rendering', function (hooks) {
  setupRenderingTest(hooks);

  test('it works', async function (assert) {
    class TestComponent extends Component {
      @tracked count = 1;

      data = trackedFunction(this, () => {
        return this.count;
      });
      increment = () => this.count++;

      <template>
        <out>{{this.data.value}}</out>
        <button type="button" {{on "click" this.increment}}></button>
      </template>
    }

    await render(<template><TestComponent /></template>);

    assert.dom('out').hasText('1');

    await click('button');

    assert.dom('out').hasText('2');
  });

  test('it is retryable', async function (assert) {
    let count = 0;

    class TestComponent extends Component {
      data = trackedFunction(this, () => {
        // Copy the count so asynchrony of trackedFunction evaluation
        // doesn't return a newer value than existed at the time
        // of the function invocation.
        let localCount = count;

        count++;
        assert.step(`ran trackedFunction ${localCount}`);

        return localCount;
      });

      <template>
        <out>{{this.data.value}}</out>
        <button type="button" {{on "click" this.data.retry}}></button>
      </template>
    }

    await render(<template><TestComponent /></template>);
    assert.verifySteps(['ran trackedFunction 0']);

    assert.dom('out').hasText('0');

    await click('button');
    assert.verifySteps(['ran trackedFunction 1']);

    assert.dom('out').hasText('1');

    assert.verifySteps([]);
  });

  test('async functions update when the promise resolves', async function (assert) {
    class TestComponent extends Component {
      @tracked multiplier = 1;

      increment = () => this.multiplier++;

      data = trackedFunction(this, async () => {
        // tracked data consumed here directly does not entangle with the function (deliberately)
        let { multiplier } = this;

        await timeout(50);

        return 2 * multiplier;
      });

      <template>
        <out>{{this.data.value}}</out>
        <button type="button" {{on "click" this.increment}}></button>
      </template>
    }

    render(<template><TestComponent /></template>);

    await timeout(25);
    assert.dom('out').hasText('');

    await settled();

    assert.dom('out').hasText('2');

    await click('button');

    assert.dom('out').hasText('4');
  });

  test('can be "use"d in a class', async function (assert) {
    const Doubler = resourceFactory((numFn) =>
      trackedFunction(async () => {
        let num = numFn();

        return num * 2;
      })
    );

    class TestComponent extends Component {
      @tracked multiplier = 1;

      increment = () => this.multiplier++;

      data = use(
        this,
        Doubler(() => this.multiplier)
      );

      <template>
        <out>{{this.data.current.value}}</out>
        <button type="button" {{on "click" this.increment}}></button>
      </template>
    }

    await render(<template><TestComponent /></template>);

    assert.dom('out').hasText('2');

    await click('button');

    assert.dom('out').hasText('4');
  });

  type NumberThunk = () => number;
  test('can be composed directly within a resource', async function (assert) {
    const Doubled = resourceFactory((num: number) => {
      return resource(({ use }) => {
        let state = use(trackedFunction(() => num * 2));

        return () => state.current.value;
      });
    });

    class State {
      @tracked num = 2;
    }

    let state = new State();

    setOwner(state, this.owner);

    await render(
      <template>
        <out>{{Doubled state.num}}</out>
      </template>
    );

    assert.dom('out').hasText('4');
  });

  test('can be composed with the resource use', async function (assert) {
    const Sqrt = resourceFactory((numFn: NumberThunk) =>
      trackedFunction(async () => {
        let num = numFn();

        return Math.sqrt(num);
      })
    );

    const Squared = resourceFactory((numFn: NumberThunk) =>
      trackedFunction(async () => {
        let num = numFn();

        return Math.pow(num, 2);
      })
    );

    const Hypotenuse = resourceFactory((aFn: NumberThunk, bFn: NumberThunk) => {
      return resource(({ use }) => {
        const aSquared = use(Squared(aFn));
        const bSquared = use(Squared(bFn));
        const c = use(
          Sqrt(() => {
            return (aSquared.current.value ?? 0) + (bSquared.current.value ?? 0);
          })
        );

        return () => c.current.value;
      });
    });

    class State {
      @tracked a = 3;
      @tracked b = 4;

      c = use(
        this,
        Hypotenuse(
          () => this.a,
          () => this.b
        )
      );
    }

    let state = new State();

    setOwner(state, this.owner);

    await render(
      <template>
        <out>{{state.c}}</out>
      </template>
    );

    assert.dom('out').hasText('5');

    state.a = 7;
    await settled();

    assert.dom('out').containsText('8.06');

    state.b = 10;
    await settled();
    assert.dom('out').containsText('12.206');
  });

  test('failing case', async function (assert) {
    class TestCase {
      @tracked length = 0;
      @tracked value;

      setLength = () => (this.length = 3);

      callCount = 0;
      isPending = true;
      getValue = async () => {
        this.callCount++;

        if (this.callCount > 20) {
          console.log('getValue() too much calling', this.callCount);

          return;
        }

        let { length, isPending } = this;

        if (!this.isPending && this.value?.[0] === 'not yet') {
          console.log('getValue() early return', { length, isPending });

          return;
        }

        // detach from auto-tracking
        await Promise.resolve();
        console.group('getValue');

        if (!length) {
          if (this.value?.[0] === 'not yet') {
            console.log('getValue() value is already set to net yet');

            console.groupEnd();

            return;
          }

          console.log('getValue() setting value to net yet', { length, isPending });
          this.value = ['not yet'];

          console.groupEnd();

          return;
        }

        const stringArray = Array.from({ length }, () => 'item'); // ['item', 'item', 'item']

        // console.log(debug.logTrackingStack());
        console.log('getValue() setting value');
        this.value = stringArray;
        this.isPending = false;
        console.groupEnd();
      };

      get endResult() {
        console.group('endResult');

        // eslint-disable-next-line no-console
        console.log('this.endResult', { length: this.length, value: this.value });

        this.getValue();

        let value = this.value;

        if (!value) {
          console.log('this.endResult: no value');

          console.groupEnd();

          return '';
        }

        console.log('this.endResult: should have value', value);

        console.groupEnd();

        return value.join(',');
      }
    }

    const logText = modifier(function (_element, positional, named) {
      // eslint-disable-next-line no-console
      console.log('{{logText}}', positional[0], named.bar, named.foo);

      return () => {};
    });

    class State {
      @tracked testCase?: TestCase;

      setTestCase = () => (this.testCase = new TestCase());
    }

    let state = new State();

    const setLength = () => state.testCase?.setLength();

    await render(
      <template>
        <!-- {{#if state.testCase}} -->
        <!--   {{(state.testCase.getValue)}} -->
        <!-- {{/if}} -->
        Does not make work
        <!-- {{log state.testCase.lengthPromise.value}} -->
        Makes work
        <!-- {{log state.testCase.stringArray.value}} -->
        <!-- {{log state.testCase.endResult}} -->
        Breaks
        <div {{logText bar=state.testCase.endResult foo="foo"}} />
        <out>{{state.testCase.endResult}}</out>
        <button id="setTestCase" type="button" {{on "click" state.setTestCase}}>set testcase</button>
        <button id="setLength" type="button" {{on "click" setLength}}>set length ({{state.testCase.length}})</button>
      </template>
    );

    assert.dom('out').doesNotIncludeText('item');

    // await this.pauseTest();
    await click('#setTestCase');
    await new Promise((r) => setTimeout(r, 100));
    await click('#setLength');
    await new Promise((r) => setTimeout(r, 100));
    // await this.pauseTest();

    assert.dom('out').hasText('item,item,item');
  });
});
