import { renderSettled } from '@ember/renderer';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { ReactiveImage } from 'reactive-primitives/image';

import { stepProperties } from './assertions';

const properties = ['value', 'isResolved', 'isLoading', 'isError'];
const tinyProfilePic = 'https://avatars.githubusercontent.com/u/199018?s=40&v=4';

module('ReactiveImage', function (hooks) {
  setupRenderingTest(hooks);

  test('it handles errors', async function (assert) {
    render(
      <template>
        {{#let (ReactiveImage 'broken-url') as |state|}}
          {{stepProperties assert state properties}}
        {{/let}}
      </template>
    );

    await renderSettled();

    assert.verifySteps([
      'value: null',
      'isResolved: false',
      'isLoading: true',
      'isError: false',
    ]);

    await renderSettled();

    // TODO: is there a way to optimize this away?
    //       so that we only re-render once?
    assert.verifySteps([
      'value: null',
      'isResolved: false',
      'isLoading: true',
      'isError: false',
    ]);

    await settled();

    assert.verifySteps([
      'value: null',
      'isResolved: false',
      'isLoading: false',
      'isError: true',
    ]);
  });


  test('it handles success', async function (assert) {
    render(
      <template>
        {{#let (ReactiveImage tinyProfilePic) as |state|}}
          {{stepProperties assert state properties}}
        {{/let}}
      </template>
    );

    await renderSettled();

    assert.verifySteps([
      'value: null',
      'isResolved: false',
      'isLoading: true',
      'isError: false',
    ]);

    await renderSettled();

    // TODO: is there a way to optimize this away?
    //       so that we only re-render once?
    assert.verifySteps([
      'value: null',
      'isResolved: false',
      'isLoading: true',
      'isError: false',
    ]);

    await settled();

    assert.verifySteps([
      'value: [object Event]',
      'isResolved: true',
      'isLoading: false',
      'isError: false',
    ]);
  });
});
