import { render, settled } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { cell } from 'ember-resources';
import { addLink } from 'reactiveweb/document-head';

function numLinks() {
  let style = [...document.head.querySelectorAll('link')];

  return style.length;
}

const style = {
  color: 'rgba(1, 100, 234, 0.7)',
};

const defaultStyle = {
  color: 'rgb(0, 0, 0)',
};

module('addLink', function (hooks) {
  setupRenderingTest(hooks);

  test('works', async function (assert) {
    await render(
      <template>
        {{addLink "/style-that-succeeds.css"}}
        <div class="foo">text</div>
      </template>
    );

    assert.dom('.foo').hasStyle(style);
  });

  test('style is removed from <head> when template block is removed', async function (assert) {
    let originalNumScripts = numLinks();
    let show = cell(true);

    await render(
      <template>
        <div class="foo">text</div>
        {{#if show.current}}
          {{addLink "/style-that-succeeds.css"}}
        {{/if}}
      </template>
    );

    assert.dom('.foo').hasStyle(style);
    assert.strictEqual(numLinks(), originalNumScripts + 1);

    show.current = false;
    await settled();

    assert.dom('.foo').hasStyle(defaultStyle);
    assert.strictEqual(numLinks(), originalNumScripts);
  });

  test('the same style cannot be added more than once', async function (assert) {
    let originalNumScripts = numLinks();

    let show = cell(true);

    await render(
      <template>
        <div class="foo">text</div>
        {{#if show.current}}
          {{addLink "/style-that-succeeds.css"}}
          {{addLink "/style-that-succeeds.css"}}
          {{addLink "/style-that-succeeds.css"}}
          {{addLink "/style-that-succeeds.css"}}
          {{addLink "/style-that-succeeds.css"}}
          {{addLink "/style-that-succeeds.css"}}
        {{/if}}
      </template>
    );

    assert.dom('.foo').hasStyle(style);
    assert.strictEqual(numLinks(), originalNumScripts + 1);

    show.current = false;
    await settled();

    assert.strictEqual(numLinks(), originalNumScripts);
  });

  /**
   * QUnit doesn't have a way to capture this type of error
   */
  skip('style does not exist (captured via onerror)', async function (assert) {
    let originalNumScripts = numLinks();

    function handleError(e: unknown) {
      console.error(`Captured:`, e);
      assert.step(String(e));
    }

    window.addEventListener('unhandledrejection', handleError);

    await render(
      <template>
        {{! @glint-expect-error type mismatch? }}
        {{addLink "/dne.css" onerror=handleError}}
      </template>
    );

    window.removeEventListener('unhandledrejection', handleError);

    assert.strictEqual(numLinks(), originalNumScripts + 1, 'num style increased');
    assert.verifySteps([]);
  });
});
