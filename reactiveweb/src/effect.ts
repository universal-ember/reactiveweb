import { waitForPromise } from '@ember/test-waiters';

/**
 * Run an effect, reactively, based on the passed args.
 *
 * Effects should be used sparingly, if at all.
 * Typically, applications that can get away with derived data will be easier to debug and have better performance.
 *
 * However, humans naturally think in cause and effect, and when dealing with old code, you may not realize that
 * it is effectful, or causing the infinite revalidation / re-rendering protection error.
 * This utility provides a safe way for you to get around those errors at the cost of performance (in most cases, it won't be perceivable though -- unless you have a lot of effects in hot paths). It is strongly discouraged to use effects in loops, (such as #each), or any component that is rendered many times on a page.
 *
 * This can be used in JS as well is a in templates.
 * Note however, that re-runs will not occur if the JS is not being called
 * from the template in some way. The template is our reactive interface.
 *
 * ```js
 * import { effect } from 'reactiveweb/effect';
 *
 * function log(...args) {
 *   console.log(...args);
 * }
 *
 * <template>
 *   {{effect log "foo"}}
 *
 *   {{effect (fn log "bar")}}
 * </template>
 * ```
 *
 * and from JS:
 * ```js
 * import { effect } from 'reactiveweb/effect';
 *
 * function log(...args) {
 *   effect(...args);
 * }
 *
 * <template>
 *   {{log "foo"}}
 * </template>
 * ```
 */
export function effect(fn: (...args: unknown[]) => void | Promise<void>, ...args: unknown[]) {
  waitForPromise(
    (async () => {
      /**
       * Awaiting detaches from the open tracking frame from
       * each `getValueFromRef` (in the renderer).
       *
       * Each <{Here}>, <Comp {{here}}>, {{here}}, etc use `getValueFromRef`,
       * which does something like this:
       * ```js
       * beginTrackingFrame()
       *
       *  get the value
       *
       * endTrackingFrame();
       * ```
       * This is synchronous, so when we await, we delay execution of the function until the tracking frame has closed.
       * Auto-tracking is always synchronous and always self-contained, so there is no risk of
       */
      await 0;
      await fn(...args);
    })()
  );
}
