import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

type DePromise<Value> = Value extends Promise<infer Result> ? Result : Value;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolvedValueOf<Value> = Value extends (...args: any[]) => any
  ? DePromise<ReturnType<Value>>
  : DePromise<Value>;

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
    error: Error | string | null;
    resolved: Result | undefined;
  };
}

const promiseCache = new WeakMap<object, State<unknown>>();

export const REASON_FUNCTION_EXCEPTION = `Passed function threw an exception`;
export const REASON_PROMISE_REJECTION = `Promise rejected while waiting to resolve`;

class StateImpl<Value> implements State<Value> {
  /**
   * @private
   */
  @tracked _isLoading: undefined | boolean;
  /**
   * @private
   */
  @tracked _error: undefined | null | Error;
  /**
   * @private
   */
  @tracked _resolved: undefined | Value;

  #initial: undefined | Partial<State<Value>>;

  constructor(fn: GetPromiseStateInput<Value>, initial?: Partial<State<Value>>) {
    this.#initial = initial;

    try {
      var maybePromise = isThennable(fn) ? fn : isFunction(fn) ? fn() : fn;
    } catch (e) {
      this.#initial = {
        isLoading: false,
        error: { reason: REASON_FUNCTION_EXCEPTION, original: e },
      };

      return;
    }

    if (typeof maybePromise === 'object' && maybePromise !== null && 'then' in maybePromise) {
      waitForPromise(
        maybePromise
          .then((value) => (this._resolved = value))
          .catch((error) => (this._error = { reason: REASON_PROMISE_REJECTION, original: error }))
          .finally(() => (this._isLoading = false))
      );

      return;
    }

    this.#initial = { isLoading: false, error: null, resolved: maybePromise };
  }

  get isLoading() {
    return this._isLoading ?? this.#initial?.isLoading ?? false;
  }
  get error() {
    return this._error ?? this.#initial?.error ?? null;
  }
  get resolved() {
    return this._resolved ?? this.#initial?.resolved;
  }

  toJSON() {
    return { isLoading: this.isLoading, error: this.error, resolved: this.resolved };
  }
}

export type GetPromiseStateInput<Value> =
  | Value
  | Promise<Value>
  | (() => Value)
  | (() => Promise<Value>);

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
export function getPromiseState<Value, Result = ResolvedValueOf<Value>>(
  fn: GetPromiseStateInput<Value>
): State<Result> {
  if (typeof fn !== 'function' && !isThennable(fn)) {
    return {
      isLoading: false,
      error: null,
      resolved: fn,
      toJSON() {
        return { isLoading: false, error: null, resolved: fn };
      },
    } as State<Result>;
  }

  let existing = promiseCache.get(fn);

  if (existing) return existing as State<Result>;

  let state = new StateImpl(fn, { isLoading: true });

  promiseCache.set(fn, state);

  return state as State<Result>;
}

function isThennable(x: unknown): x is Promise<unknown> {
  if (typeof x !== 'object') return false;
  if (!x) return false;

  return 'then' in x;
}

/**
 * This exists because when you guard with typeof x === function normally in TS,
 * you just get `& Function` added to your type, which isn't exactly the narrowing I want.
 *
 * This can result in "Value & Function" has no call signatures....
 * which is kinda ridiculous.
 */
function isFunction(x: unknown): x is () => unknown {
  return typeof x === 'function';
}
