import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { click, render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';

import { HttpResponse } from 'msw';
import { RemoteData } from 'reactiveweb/remote-data';
import { setupMSW } from 'test-app/tests/msw';

const data = [
  { id: '1', type: 'blogs', attributes: { name: `name:1` } },
  { id: '2', type: 'blogs', attributes: { name: `name:2` } },
  { id: '3', type: 'blogs', attributes: { name: `name:3` } },
];

const safeName = (blog: any): string => blog?.value?.attributes?.name;

module('Utils | remote-data | rendering', function (hooks) {
  setupRenderingTest(hooks);
  setupMSW(hooks, ({ http }) => [
    http.get('/blogs/:id', ({ params }) => {
      const record = data.find((datum) => datum.id === params['id']);

      return HttpResponse.json({ ...record });
    }),
  ]);

  module('RemoteData', function () {
    test('works with static url', async function (assert) {
      await render(
        <template>
          {{#let (RemoteData "/blogs/1") as |blog|}}
            {{safeName blog}}
          {{/let}}
        </template>
      );

      assert.dom().hasText('name:1');
    });

    test('works with dynamic url', async function (assert) {
      class Test {
        @tracked id = 1;

        get url() {
          return `/blogs/${this.id}`;
        }
      }

      const foo = new Test();

      await render(
        <template>
          {{#let (RemoteData foo.url) as |blog|}}
            {{safeName blog}}
          {{/let}}
        </template>
      );

      assert.dom().hasText('name:1');

      foo.id = 2;
      await settled();

      assert.dom().hasText('name:2');
    });

    test('works with an incrementing url', async function (assert) {
      class Test {
        @tracked id = 1;

        get url() {
          return `/blogs/${this.id}`;
        }

        update = () => this.id++;
      }

      const foo = new Test();

      await render(
        <template>
          {{#let (RemoteData foo.url) as |blog|}}
            <out>{{safeName blog}}</out>
          {{/let}}

          <button {{on "click" foo.update}} type="button">++</button>
        </template>
      );

      assert.dom('out').hasText('name:1');

      await click('button');

      assert.dom('out').hasText('name:2');
    });
  });
});
