import { warn } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';
import { resourceFactory, resource } from 'ember-resources';

/**
 * Inspired from: https://github.com/hupe1980/react-script-hook/blob/master/src/use-script.tsx
 */

/**
 * Adds a `<script>` element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the script with the same URL.
 *
 * @example
 * ```js
 * import { addScript } from 'reactiveweb/document-head';
 *
 * <template>
 *  {{addScript "https://my.cdn.com/asset/v1.2.3/file/path.js"}}
 * </template>
 * ```
 */
function addScript(url, attributes) {
  const resolvedURL = typeof url === 'function' ? url() : url;
  return resource(({
    on
  }) => {
    const existing = document.querySelector(`script[src="${resolvedURL}"]`);

    // Nothing to do, something else is managing this script
    if (existing) {
      warn(`Something else added a <script> tag with the URL: ${url} to the page. Early exiiting. Will not cleanup.`, {
        id: 'reactiveweb/document-head#addScript'
      });
      return;
    }
    const el = document.createElement('script');
    let resolve;
    let reject;
    const promise = new Promise((r, e) => {
      resolve = r;
      reject = e;
    });
    waitForPromise(promise);
    Object.assign(el, {
      ...attributes,
      src: resolvedURL,
      onload: event => {
        resolve();
        if (typeof attributes?.onload === 'function') {
          attributes.onload(event);
        }
      },
      onerror: reason => {
        reject(reason);
        if (typeof attributes?.onerror === 'function') {
          attributes.onerror(reason);
        }
      }
    });
    document.head.appendChild(el);
    on.cleanup(() => {
      el.remove();
      resolve();
    });

    /**
     * We must return nothing so that nothing renders.
     * (helpers and resources have their return value rendered, but undefined is "nothing")
     */
    return;
  });
}
resourceFactory(addScript);

/**
 * Adds a `<link>` element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the link with the same URL.
 *
 * @example
 * ```js
 * import { addLink } from 'reactiveweb/document-head';
 *
 * <template>
 *  {{addLink "https://my.cdn.com/asset/v1.2.3/file/path.css"}}
 * </template>
 * ```
 */
function addLink(url, attributes) {
  const resolvedURL = typeof url === 'function' ? url() : url;
  return resource(({
    on
  }) => {
    const existing = document.querySelector(`link[href="${resolvedURL}"]`);

    // Nothing to do, something else is managing this script
    if (existing) {
      warn(`Something else added a <link> tag with the URL: ${url} to the page. Early exiiting. Will not cleanup.`, {
        id: 'reactiveweb/document-addLink'
      });
      return;
    }
    const el = document.createElement('link');
    let resolve;
    let reject;
    const promise = new Promise((r, e) => {
      resolve = r;
      reject = e;
    });
    waitForPromise(promise);
    Object.assign(el, {
      rel: 'stylesheet',
      href: resolvedURL,
      ...attributes,
      onload: event => {
        resolve();
        if (typeof attributes?.onload === 'function') {
          attributes.onload(event);
        }
      },
      onerror: reason => {
        reject(reason);
        if (typeof attributes?.onerror === 'function') {
          attributes.onerror(reason);
        }
        return true;
      }
    });
    document.head.appendChild(el);
    on.cleanup(() => {
      el.remove();
      resolve();
    });

    /**
     * We must return nothing so that nothing renders.
     * (helpers and resources have their return value rendered, but undefined is "nothing")
     */
    return;
  });
}
resourceFactory(addLink);

export { addLink, addScript };
//# sourceMappingURL=document-head.js.map
