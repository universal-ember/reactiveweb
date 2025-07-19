import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

type DePromise<Value> = Value extends Promise<infer Result> ? Result : Value;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolvedValueOf<Value> = Value extends (...args: any[]) => any
  ? DePromise<ReturnType<Value>>
  : DePromise<Value>;

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
  error: undefined | null | string | Error;
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

class StateImpl<Value> implements State<Value> {
  /**
   * @private
   */
  @tracked _isLoading: undefined | boolean;
  /**
   * @private
   */
  @tracked _error: undefined | null | string;
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
      this.#initial = { isLoading: false, error: e };
      return;
    }

    if (typeof maybePromise === 'object' && maybePromise !== null && 'then' in maybePromise) {
      waitForPromise(
        maybePromise
          .then((value) => (this._resolved = value))
          .catch((error) => (this._error = error))
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
 * Normally when trying to derive async state, you'll first need to
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
