/**
 * Inspired from: https://github.com/hupe1980/react-script-hook/blob/master/src/use-script.tsx
 */
import { warn } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';

import { resource, resourceFactory } from 'ember-resources';

/**
 * Adds a <script> element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the script with the same URL.
 */
export function addScriptToHead(
  url: string | (() => string),
  attributes: Record<keyof HTMLScriptElement, unknown>
) {
  let resolvedURL = typeof url === 'function' ? url() : url;

  return resource(({ on }) => {
    const existing = document.querySelector(`script[src="${resolvedURL}"]`);

    // Nothing to do, something else is managing this script
    if (existing) {
      warn(
        `Something else added a <script> tag with the URL: ${url} to the page. Early exiiting. Will not cleanup.`
      );

      return;
    }

    let el = document.createElement('script');
    let resolve: (x?: unknown) => void;
    let reject: (reason: unknown) => void;
    let promise = new Promise((r, e) => {
      resolve = r;
      reject = e;
    });

    waitForPromise(promise);

    Object.assign(el, {
      ...attributes,
      src: resolvedURL,
      onload: (...args: unknown[]) => {
        resolve();

        if (typeof attributes.onload === 'function') {
          attributes.onload(...args);
        }
      },
      onerror: (reason: unknown) => {
        reject(reason);

        if (typeof attributes.onerror === 'function') {
          attributes.onerror(reason);
        }
      },
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

resourceFactory(addScriptToHead);
