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
 */
export declare function getPromiseState<Value, Result = ResolvedValueOf<Value>>(fn: GetPromiseStateInput<Value>): State<Result>;
export {};
//# sourceMappingURL=get-promise-state.d.ts.map