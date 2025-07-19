import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

type DePromise<Value> = Value extends Promise<infer Result> ? Result : Value;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ResolvedValueOf<Value> = Value extends (...args: any[]) => any
  ? DePromise<ReturnType<Value>>
  : DePromise<Value>;

export interface State<Result> {
  isLoading: boolean;
  error: undefined | null | string | Error;
  resolved: Result | undefined;

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

    let maybePromise = isThennable(fn) ? fn : isFunction(fn) ? fn() : fn;

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
 * Returns a reactive state for a give
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
