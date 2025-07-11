import { render, settled } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell } from 'ember-resources';
import { addScript } from 'reactiveweb/document-head';

function numScripts() {
  let scripts = [...document.head.querySelectorAll('script')];

  return scripts.length;
}

function getKnownGlobal(): unknown {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return window.__reactiveweb_test__;
}

module('addScript', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    delete window.__reactiveweb_test__;
  });

  test('works', async function (assert) {
    assert.strictEqual(getKnownGlobal(), undefined);

    await render(<template>{{addScript "/script-that-succeeds.js"}}</template>);

    assert.strictEqual(getKnownGlobal(), 'success');
  });

  test('script is removed from <head> when template block is removed', async function (assert) {
    let originalNumScripts = numScripts();

    assert.strictEqual(getKnownGlobal(), undefined);

    let show = cell(true);

    await render(
      <template>
        {{#if show.current}}
          {{addScript "/script-that-succeeds.js"}}
        {{/if}}
      </template>
    );

    assert.strictEqual(getKnownGlobal(), 'success');
    assert.strictEqual(numScripts(), originalNumScripts + 1);

    show.current = false;
    await settled();

    assert.strictEqual(numScripts(), originalNumScripts);
  });

  test('the same script cannot be added more than once', async function (assert) {
    let originalNumScripts = numScripts();

    assert.strictEqual(getKnownGlobal(), undefined);

    let show = cell(true);

    await render(
      <template>
        {{#if show.current}}
          {{addScript "/script-that-succeeds.js"}}
          {{addScript "/script-that-succeeds.js"}}
          {{addScript "/script-that-succeeds.js"}}
          {{addScript "/script-that-succeeds.js"}}
          {{addScript "/script-that-succeeds.js"}}
          {{addScript "/script-that-succeeds.js"}}
        {{/if}}
      </template>
    );

    assert.strictEqual(getKnownGlobal(), 'success');
    assert.strictEqual(numScripts(), originalNumScripts + 1);

    show.current = false;
    await settled();

    assert.strictEqual(numScripts(), originalNumScripts);
  });

  test('script throws an error while loading', async function (assert) {
    let originalNumScripts = numScripts();

    assert.strictEqual(getKnownGlobal(), undefined);

    function handleError(e: unknown) {
      console.error(`Captured:`, e);
      assert.step(String((e as Error).message.split(':')[1]?.trim()));
    }

    window.addEventListener('error', handleError);

    await render(<template>{{addScript "/script-that-errors.js"}}</template>);

    window.removeEventListener('error', handleError);

    assert.strictEqual(numScripts(), originalNumScripts + 1);
    assert.verifySteps(['Intentional error']);
  });

  /**
   * QUnit doesn't have a way to capture this type of error
   */
  skip('script does not exist', async function (assert) {
    let originalNumScripts = numScripts();

    function handleError(e: unknown) {
      console.error(`Captured:`, e);
      assert.step((e as Error).message);
    }

    window.addEventListener('error', handleError);

    await render(<template>{{addScript "/dne.js"}}</template>);

    window.removeEventListener('error', handleError);

    assert.strictEqual(numScripts(), originalNumScripts + 1, 'num scripts increased');
    assert.verifySteps([]);
  });
});
