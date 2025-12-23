import { tracked } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import { resource, use } from 'ember-resources';
import { HttpResponse } from 'msw';
import { RemoteData, remoteData } from 'reactiveweb/remote-data';
import { setupMSW } from 'vite-app/tests/msw';

const data = [
  { id: '1', type: 'blogs', attributes: { name: `name:1` } },
  { id: '2', type: 'blogs', attributes: { name: `name:2` } },
  { id: '3', type: 'blogs', attributes: { name: `name:3` } },
];

module('Utils | remote-data | js', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks, ({ http }) => [
    http.get('/blogs/:id', ({ params, request }) => {
      const record = data.find((datum) => datum.id === params['id']);

      if (record) {
        const extra: Record<string, unknown> = {};

        /**
         * The Authorization header here is used in testing to
         * assert that headers were passed successfully
         *
         * all of the lifecycle is abstracted away in the `RemoteData` api
         */
        if (request.headers.get('Authorization')) {
          extra['Authorization'] = request.headers.get('Authorization');
        }

        return HttpResponse.json({ ...record, ...extra });
      }

      return HttpResponse.json(
        { errors: [{ status: '404', detail: 'Blog not found' }] },
        { status: 404 }
      );
    }),
    http.get('/text-error/:id', () => {
      return HttpResponse.text('hello world', { status: 500 });
    }),
    http.get('/text-success/:id', () => {
      return HttpResponse.text('hello world');
    }),
  ]);

  module('RemoteData', function () {
    test('works with static url', async function (assert) {
      class Test {
        @use request = RemoteData('/blogs/1');
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.strictEqual(test.request.status, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, data[0]);
      assert.false(test.request.isLoading);
      assert.false(test.request.isError);
      assert.true(test.request.isResolved);
      assert.strictEqual(test.request.status, 200);
    });

    test('works with static options', async function (assert) {
      class Test {
        @use request = RemoteData('/blogs/1', {
          headers: {
            Authorization: 'Bearer <token>',
          },
        });
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.strictEqual(test.request.status, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer <token>' });
      assert.false(test.request.isLoading);
      assert.false(test.request.isError);
      assert.true(test.request.isResolved);
      assert.strictEqual(test.request.status, 200);
    });

    test('works with reactive url', async function (assert) {
      class Test {
        @tracked url = '/blogs/1';
        @use request = RemoteData(() => this.url);
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      await settled();
      assert.deepEqual(test.request.value, data[0]);

      test.url = '/blogs/2';
      assert.true(test.request.isLoading);
      await settled();
      assert.false(test.request.isLoading);
      assert.deepEqual(test.request.value, data[1]);
    });

    test('works with reactive options', async function (assert) {
      class Test {
        @tracked url = '/blogs/1';
        @tracked apiToken = '<token>';

        @use request = RemoteData(() => ({
          url: this.url,
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
        }));
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      await settled();
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer <token>' });

      test.apiToken = 'abc, 123';
      assert.true(test.request.isLoading);
      await settled();
      assert.false(test.request.isLoading);
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer abc, 123' });
    });

    test('gracefully handles errors', async function (assert) {
      class Test {
        @use request = RemoteData('/blogs/1000');
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.strictEqual(test.request.status, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, {
        errors: [{ detail: 'Blog not found', status: '404' }],
      });
      assert.false(test.request.isLoading);
      assert.true(test.request.isError, 'isError');
      assert.true(test.request.isResolved);
      assert.strictEqual(test.request.status, 404, 'expected status');
    });

    module('works with non-json requests', function () {
      test('text with a successful response', async function (assert) {
        class Test {
          @use request = RemoteData('/text-success/100');
        }

        const test = new Test();

        setOwner(test, this.owner);

        assert.strictEqual(test.request.status, null);
        await settled();

        assert.strictEqual(test.request.value, 'hello world');

        assert.strictEqual(test.request.status, 200);
      });

      test('text with an error response', async function (assert) {
        class Test {
          @use request = RemoteData('/text-error/100');
        }

        const test = new Test();

        setOwner(test, this.owner);

        assert.strictEqual(test.request.status, null);
        await settled();

        assert.strictEqual(test.request.value, 'hello world');

        assert.strictEqual(test.request.status, 500);
      });
    });
  });

  module('remoteData', function () {
    test('works with static url', async function (assert) {
      class Test {
        @use request = resource((api) => remoteData(api, `/blogs/1`));
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, data[0]);
      assert.false(test.request.isLoading);
      assert.false(test.request.isError);
      assert.true(test.request.isResolved);
    });

    test('works without @use', async function (assert) {
      class Test {
        request = resource(this, (api) => remoteData(api, `/blogs/1`));
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, data[0]);
      assert.false(test.request.isLoading);
      assert.false(test.request.isError);
      assert.true(test.request.isResolved);
    });

    test('works with static options', async function (assert) {
      class Test {
        @use request = resource((api) =>
          remoteData(api, '/blogs/1', {
            headers: {
              Authorization: 'Bearer <token>',
            },
          })
        );
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.strictEqual(test.request.status, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer <token>' });
      assert.false(test.request.isLoading);
      assert.false(test.request.isError);
      assert.true(test.request.isResolved);
      assert.strictEqual(test.request.status, 200);
    });

    test('works with reactive url', async function (assert) {
      class Test {
        @tracked url = '/blogs/1';
        @use request = resource((api) => remoteData(api, this.url));
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      await settled();
      assert.deepEqual(test.request.value, data[0]);

      test.url = '/blogs/2';
      assert.true(test.request.isLoading);
      await settled();
      assert.false(test.request.isLoading);
      assert.deepEqual(test.request.value, data[1]);
    });

    test('works with reactive options', async function (assert) {
      class Test {
        @tracked url = '/blogs/1';
        @tracked apiToken = '<token>';

        @use request = resource((api) =>
          remoteData(api, this.url, {
            headers: {
              Authorization: `Bearer ${this.apiToken}`,
            },
          })
        );
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      await settled();
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer <token>' });

      test.apiToken = 'abc, 123';
      assert.true(test.request.isLoading);
      await settled();
      assert.false(test.request.isLoading);
      assert.deepEqual(test.request.value, { ...data[0], Authorization: 'Bearer abc, 123' });
    });

    test('gracefully handles errors', async function (assert) {
      class Test {
        @use request = resource((api) => remoteData(api, '/blogs/1000'));
      }

      const test = new Test();

      setOwner(test, this.owner);

      assert.strictEqual(test.request.value, null);
      assert.strictEqual(test.request.status, null);
      assert.true(test.request.isLoading);
      assert.false(test.request.isError);
      assert.false(test.request.isResolved);
      await settled();
      assert.deepEqual(test.request.value, {
        errors: [{ detail: 'Blog not found', status: '404' }],
      });
      assert.false(test.request.isLoading);
      assert.true(test.request.isError);
      assert.true(test.request.isResolved);
      assert.strictEqual(test.request.status, 404);
    });
  });
});
