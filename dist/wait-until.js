import { resourceFactory, resource, cell } from 'ember-resources';

/**
 * Reactively wait for a time.
 * uses setTimeout and cleans up if the caller is cleaned up.
 *
 * Usage in a template
 * ```hbs
 * {{#let (WaitUntil 500) as |delayFinished|}}
 *    {{#if delayFinished}}
 *
 *      text displayed after 500ms
 *
 *    {{/if}}
 * {{/let}}
 * ```
 */
const WaitUntil = resourceFactory(maybeDelayMs => {
  return resource(({
    on
  }) => {
    const delayMs = typeof maybeDelayMs === 'function' ? maybeDelayMs() : maybeDelayMs;

    // If we don't have a delay, we can start with
    // immediately saying "we're done waiting"
    const initialValue = delayMs ? false : true;
    const delayFinished = cell(initialValue);
    if (delayMs) {
      const timer = setTimeout(() => delayFinished.current = true, delayMs);
      on.cleanup(() => clearTimeout(timer));
    }

    // Collapse the state that Cell provides to just a boolean
    return () => delayFinished.current;
  });
});

export { WaitUntil };
//# sourceMappingURL=wait-until.js.map
