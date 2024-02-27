
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { trackedFunction } from 'reactiveweb/function';

const asString = (x: unknown) => `${x}`;

module('Utils | trackedFunction | rendering w/errors', function (hooks) {
  setupRenderingTest(hooks);

  test('it catches errors', async function (assert) {
    class TestComponent extends Component {
      data = trackedFunction(this, () => {
        throw new Error('Never resolves successfully');
      });

      <template>
         state: {{this.data.state}}
         isSettled: {{this.data.isSettled}}
         isError: {{this.data.isError}}
         isRejected: {{this.data.isRejected}}
         error: {{asString this.data.error}}
      </template>
    }

    await render(<template><TestComponent /></template>);

    assert.dom().hasText('state: UNSTARTED isSettled: true isError: true isRejected: true error: Error: Never resolves successfully');
  });

  test('it can resume with non-error after an error', async function (assert) {

class State {
  @tracked doError = true;
}

    let state = new State();
let i = 0;

    class TestComponent extends Component {
      doError = true;

      data = trackedFunction(this, async () => {
assert.step(`call:${i++}`);


        if (state.doError) {
          throw new Error('oh no');
        }

        return 'success';
      });

      <template>
         state: {{this.data.state}}
         isSettled: {{this.data.isSettled}}
         isError: {{this.data.isError}}
         isRejected: {{this.data.isRejected}}
         error: {{asString this.data.error}}
         value: {{asString this.data.value}}
      </template>
    }

    await render(<template><TestComponent /></template>);

assert.dom().hasText('state: REJECTED isSettled: true isError: true isRejected: true error: Error: oh no value: null');

assert.verifySteps(['call:0']);

state.doError = false;
await settled();

assert.verifySteps(['call:1']);
assert.dom().hasText('state: RESOLVED isSettled: true isError: false isRejected: false error: null value: success');
  });

  test('after an await, it catches errors', async function (assert) {
    class TestComponent extends Component {
      data = trackedFunction(this, async () => {
        await Promise.resolve();
        throw new Error('Never resolves successfully');
      });

      <template>
         state: {{this.data.state}}
         isSettled: {{this.data.isSettled}}
         isError: {{this.data.isError}}
         isRejected: {{this.data.isRejected}}
         error: {{asString this.data.error}}
      </template>
    }

    await render(<template><TestComponent /></template>);


    assert.dom().hasText('state: REJECTED isSettled: true isError: true isRejected: true error: Error: Never resolves successfully');
  });

  test('after an await, it can resume with non-error after an error', async function (assert) {

class State {
  @tracked doError = true;
}

    let state = new State();
let i = 0;

    class TestComponent extends Component {
      doError = true;

      data = trackedFunction(this, async () => {
assert.step(`call:${i++}`);


        if (state.doError) {
          await Promise.resolve();
          throw new Error('oh no');
        }

          await Promise.resolve();

        return 'success';
      });

      <template>
         state: {{this.data.state}}
         isSettled: {{this.data.isSettled}}
         isError: {{this.data.isError}}
         isRejected: {{this.data.isRejected}}
         error: {{asString this.data.error}}
         value: {{asString this.data.value}}
      </template>
    }

    await render(<template><TestComponent /></template>);

assert.dom().hasText('state: REJECTED isSettled: true isError: true isRejected: true error: Error: oh no value: null');

assert.verifySteps(['call:0']);

state.doError = false;
await settled();

assert.verifySteps(['call:1']);
assert.dom().hasText('state: RESOLVED isSettled: true isError: false isRejected: false error: null value: success');
  });
});
