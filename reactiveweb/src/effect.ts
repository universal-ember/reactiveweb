 

import { assert } from '@ember/debug';
import { waitForPromise } from '@ember/test-waiters';

/**
 * Run an effect, reactively, based on the passed args.
 *
 * Effects are an escape-hatch that _can_ hurt performance. We acknowledge that there are real use cases where you need to escape the reactive system and instead of everyone implementing the same boilerplate to do so, this utility helps codify the reactive-system escapement.
 *
 * Note that typically, applications that can get away with derived data will be easier to debug and have better performance.
 *
 * This utility provides a safe way for you to get around infinite revalidation / infinite rendering protection errors at the cost of performance (in most cases, it won't be perceivable though -- unless you have a lot of effects in hot paths). It is strongly discouraged to use effects in loops, (such as #each), or any component that is rendered many times on a page.
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
 *
 * When using `ember-modifier`, you may use `effect` to turn any modifier in a sort of run-once modifier:
 * ```js
 * import { effect } from 'reactiveweb/effect';
 * import { modifier } from 'ember-modifier';
 *
 * const runOnce = modifier((element, positional, named) => {
 *   effect(() => {
 *     // args accessed here are not auto-tracked
 *   });
 * });
 *
 * <template>
 *   <div {{runOnce}}></div>
 * </template>
 * ```
 *
 * Note that if args are accessed outside of the `effect`, the modifier will re-run as the args change.
 *
 * This may be done intentially for extra clarity in the non-modifier case, such as in this example
 *
 * ```js
 * import { effect } from 'reactiveweb/effect';
 *
 * function log(...args) {
 *   console.log(...args);
 * }
 *
 * <template>
 *   {{effect log @trackedValue}}
 * </template>
 * ```
 */
export function effect<Args extends any[]>(
  fn: (...args: Args) => void | Promise<void>,
  ...args: Args
) {
  assert(
    `You may not invoke a non-function. Received a typeof ${typeof fn}.`,
    typeof fn === 'function'
  );

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

/**
 * Run a _render_ effect, reactively, based on the passed args.
 *
 * Like `effect`, this is an escape-hatch and _can_ hurt performance.
 *
 * The main difference with `renderEffect` is that it enables you to measure changes to the DOM,
 * if needed, like when implementing line-clamping, or any other feature that requires a full render pass
 * before taking measurements to then make further adjustments.
 *
 * When using this, it is important to ensure that visual jitter is minimized.
 */
export function renderEffect<Args extends any[]>(
  fn: (...args: Args) => void | Promise<void>,
  ...args: Args
) {
  assert(
    `You may not invoke a non-function. Received a typeof ${typeof fn}.`,
    typeof fn === 'function'
  );

  waitForPromise(
    (async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await fn(...args);
    })()
  );
}
