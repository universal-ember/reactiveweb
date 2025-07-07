/**
 * Inspired from: https://github.com/hupe1980/react-script-hook/blob/master/src/use-script.tsx
 */
import { warn } from '@ember/debug';

import { resource, resourceFactory } from 'ember-resources';

/**
 * Adds a <script> element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the script with the same URL.
 */
export function Script(url: string, attributes: Record<keyof HTMLScriptElement, string>) {
  return resource(({ on }) => {
    const existing = document.querySelector(`script[src="${url}"]`);

    // Nothing to do, something else is managing this script
    if (existing) {
      warn(
        `Something else added a <script> tag with the URL: ${url} to the page. Early exiiting. Will not cleanup.`
      );

      return;
    }

    let el = document.createElement('script');

    Object.assign(el, attributes);

    el.src = url;

    document.head.appendChild(el);

    on.cleanup(() => {
      el.remove();
    });

    return;
  });
}

resourceFactory(Script);
