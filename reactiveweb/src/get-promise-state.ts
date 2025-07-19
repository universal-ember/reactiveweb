import { tracked } from '@glimmer/tracking';
import { waitForPromise } from '@ember/test-waiters';

export interface State<Value> {
  isLoading: boolean;
  error: undefined | null | string;
  resolved: Value | undefined;
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

    let maybePromise = 'then' in fn ? fn : fn();

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
export function getPromiseState<Value>(fn: GetPromiseStateInput<Value>): State<Value> {
  if (typeof fn !== 'function' && !isThennable(fn)) {
    return {
      isLoading: false,
      error: null,
      resolved: fn,
    };
  }

  let existing = promiseCache.get(fn);

  if (existing) return existing as State<Value>;

  let state = new StateImpl(fn, { isLoading: true });

  promiseCache.set(fn, state);

  return state;
}

function isThennable(x: unknown) {
  if (typeof x !== 'object') return false;
  if (!x) return;

  return 'then' in x;
}
