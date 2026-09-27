type DePromise<Value> = Value extends Promise<infer Result> ? Result : Value;
type ResolvedValueOf<Value> = Value extends (...args: any[]) => any ? DePromise<ReturnType<Value>> : DePromise<Value>;
/**
 * Custom error type that explains what phase of getPromiseState an error could have occurred during.
 * Provides the original error as well.
 */
export type Error = {
    /**
     * Why there is an error
     */
    reason: string;
    /**
     * The original thrown/rejected error value
     */
    original: unknown;
};
/**
 * The state of a Value or Promise that was passed to `getPromiseState`
 */
export interface State<Result> {
    /**
     * If the value passed to `getPromiseState` was a promise or function that returns a promise,
     * this will initially be true, and become false when the promise resolves or errors.
     */
    isLoading: boolean;
    /**
     * If the value passed to `getPromiseState` was a promise or function,
     * this will be the value thrown / caught from the promise or function.
     */
    error: undefined | null | Error;
    /**
     * The final value.
     * This will be undefined initially if the value passed in to `getPromiseState` is a promise or function that returns a promise.
     */
    resolved: Result | undefined;
    /**
     * JSON Serializer for inspecting the full State
     */
    toJSON(): {
        isLoading: boolean;
        error: Error | null;
        resolved: Result | undefined;
    };
}
export declare const REASON_FUNCTION_EXCEPTION = "Passed function threw an exception";
export declare const REASON_PROMISE_REJECTION = "Promise rejected while waiting to resolve";
export type GetPromiseStateInput<Value> = Value | Promise<Value> | (() => Value) | (() => Promise<Value>);
/**
 * Returns a reactive state for a given value, function, promise, or function that returns a promise.
 *
 * Also caches the result for the given value, so `getPromiseState` will become synchronous if the passed value
 * has already been resolved.
 *
 * Normally when trying to derive async state, you'll first need to invoke a function to get the promise from that function's return value.
 * With `getPromiseState`, a passed function will be invoked for you, so you can skip that step.
 *
 * @example
 * We can use `getPromiseState` to dynamically load and render a component
 *
 * ```gjs
 * import { getPromiseState } from 'reactiveweb/get-promise-state';
 *
 * let state = getPromiseState(() => import('./some-module/component'));
 *
 * <template>
 *   {{#if state.isLoading}}
 *     ... pending ...
 *   {{else if state.error}}
 *     oh no!
 *   {{else if state.resolved}}
 *     <state.resolved />
 *   {{/if}}
 * </template>
 * ```
 *
 * @example
 * `getPromiseState` can also be used in a class without `@cached`, because it maintains its own cache.
 * ```gjs
 * import Component from '@glimmer/component';
 * import { getPromiseState } from 'reactiveweb/get-promise-state';
 *
 * async function readFromSomewhere() { // implementation omitted for brevity
 * }
 *
 * export default class Demo extends Component {
 *   // doesn't matter how many times state is accessed, you get a stable state
 *   get state() {
 *     return getPromiseState(readFromSomewhere);
 *   }
 *
 *   <template>
 *     {{#if this.state.resolved}}
 *        ...
 *     {{/if}}
 *   </template>
 * }
 * ```
 *
 * @example
 * A reactively constructed function will also be used and have its result cached between uses
 *
 * ```gjs
 * import Component from '@glimmer/component';
 * import { getPromiseState } from 'reactiveweb/get-promise-state';
 *
 * async function readFromSomewhere() { // implementation omitted for brevity
 * }
 *
 * export default class Demo extends Component {
 *   // Note: the @cached is important here because we don't want repeat accesses
 *   //       to cause doAsync to be called again unless @id changes
 *   @cached
 *   get promise() {
 *     return this.doAsync(this.args.id);
 *   }
 *
 *   get state() {
 *     return getPromiseState(this.promise);
 *   }
 *
 *   <template>
 *     {{#if this.state.resolved}}
 *        ...
 *     {{/if}}
 *   </template>
 * }
 * ```
 *
 * NOTE: This `getPromiseState` is not a replacement for [WarpDrive](https://docs.warp-drive.io/)'s [getRequestState](https://www.npmjs.com/package/@warp-drive/ember#getrequeststate)
 *       namely, the `getPromiseState` in this library (reactiveweb) does not support futures, cancellation, or anything else specific to warp-drive.
 *
 *
 * --------------

_comparison of pure capability_

| . | reactiveweb | @warpdrive/ember |
| - | ----------- | ---------------- |
| use in module state[^module-state] | ✅ | ✅ |
| use in a getter[^cached-getter] | ✅ | ✅ |
| usable in template | ✅ | ✅  |
| immediate has resolved value for resolved promise | ✅  | ✅  |
| test waiter integration | ✅ | ✅ |
| allows non-promises (forgiving inputs) | ✅ | ❌ |
| can be used without build | ✅ | ❌[^warp-drive-no-build] |
| allows prepopulation of result cache by 3rd party | ❌ | ✅ |
| discriminated states (helpful for TS) | ❌[^needs-work] | ✅ |
| align with [allSettled's return value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled#return_value) | ❌[^needs-work] | ✅ |

[^warp-drive-no-build]: the warp-drive team is interested in this work, and wants to make REPLs and CDNs easier as well


All in all, they are very similar. The primary use case I had for creating my own is that I wanted dynamic module loading (with import) to be one line (shown in the first example).

reactiveweb's `getPromiseState` is made primarily for my needs in my own projects, and I don't intend to say anything negative about `@warp-drive`s `getPromiseState` -- I actually took a lot of code from it! it's a good tool.

These projects of slightly different goals, so some additional information:

_from the perspective of reactiveweb's_ set of goals:

| . | reactiveweb | @warpdrive/ember |
| - | ----------- | ---------------- |
| invokes a passed function automatically | ✅ | ❌ |
| simple state return[^state-compare] | ⚠️[^needs-work] | ⚠️ [^warp-drive-pending-deprecations] |

[^warp-drive-pending-deprecations]: has pending deprecations, otherwise ✅
[^needs-work]: This is fixable, and probably with little effort, just needs doing

_from the perspective of @warp-drive/core's set of goals_

| . | reactiveweb | @warpdrive/core |
| - | ----------- | ---------------- |
| has a simple API surface | ❌ [^invokes-functions] | ✅ |
| no dependencies | ❌ [^ember-resources] | ⚠️[^warp-drive-no-dependencies] |


[^invokes-functions]: `@warp-drive/core` strives for API simplicity, which means few (if any) overloads on its utilities.
[^warp-drive-no-dependencies]: Does not directly depend on any dependencies, but requires an integration into reactivity (which is technically true for `reactiveweb` as well)


[^module-state]: `getPromiseState(promise);`
[^cached-getter]: requires a stable reference to a promise. getter itself does not need to be cached.
[^no-dependencies]: warp-drive requires a macros config that isn't compatible with "non-config" projects (it's mostly how they generate macros to not gracefully have some behavior if you don't set up their required babel config -- which affects REPL environments (this is solveable via pushing the responsibility to configure babel to the REPLer)). Also, the warp-drive team says this is on their radar, and the'll address it eventually / soon.
[^ember-resources]: reactiveweb (as a whole) does depend on on ember-resources, but ember-resources itself has no dependencies (for real), and is a very tiny use of a helper manager. Additionally, `getPromiseState` does not depend on `ember-resources`.
[^wd-aliases]: warp-drive provides _many_ aliases for states, as well as support some extended promise behavior which is not built in to the platform (Futures, etc). This is still good for convenience and compatibility.
[^state-compare]: in reactiveweb: [State](https://reactive.nullvoxpopuli.com/interfaces/get-promise-state.State.html), and then in `@warp-drive/*`: the [`PromiseState`](https://warp-drive.io/api/@warp-drive/ember/type-aliases/PromiseState) is made of 3 sub types: [PendingPromise](https://warp-drive.io/api/@warp-drive/core/reactive/interfaces/PendingPromise), [ResolvedPromise](https://warp-drive.io/api/@warp-drive/core/reactive/interfaces/ResolvedPromise), and [RejectedPromise](https://warp-drive.io/api/@warp-drive/core/reactive/interfaces/RejectedPromise). Over time, these will align slightly with [allSettled's return value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled#return_value).
 *
 */
export declare function getPromiseState<Value, Result = ResolvedValueOf<Value>>(fn: GetPromiseStateInput<Value>): State<Result>;
export {};
//# sourceMappingURL=get-promise-state.d.ts.map