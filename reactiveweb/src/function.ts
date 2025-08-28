import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { associateDestroyableChild, destroy, isDestroyed, isDestroying } from '@ember/destroyable';

import { resource } from 'ember-resources';

import { type State as PromiseState, getPromiseState } from './get-promise-state.ts';
import { waitForPromise } from '@ember/test-waiters';

interface CallbackMeta {
  isRetrying: boolean;
}

/**
 * Any tracked data accessed in a tracked function _before_ an `await`
 * will "entangle" with the function -- we can call these accessed tracked
 * properties, the "tracked prelude". If any properties within the tracked
 * payload  change, the function will re-run.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 * import { resourceFactory, resource, use } from 'ember-resources';
 * import { trackedFunction }  from 'reactiveweb/function';
 * import { on } from '@ember/modifier';
 *
 * function Request(idFn) {
 *   return resource(({use}) => {
 *     let trackedRequest = use(trackedFunction(async () => {
 *       let id = idFn();
 *       let response = await fetch(`https://swapi.dev/api/people/${id}`);
 *       let data = await response.json();
 *
 *       return data; // { name: 'Luke Skywalker', ... }
 *     }));
 *
 *     return trackedRequest;
 *   });
 * }
 *
 * class Demo extends Component {
 *   @tracked id = 1;
 *
 *   updateId = (event) => this.id = event.target.value;
 *
 *   request = use(this, Request(() => this.id));
 *
 *   // Renders "Luke Skywalker"
 *   <template>
 *     {{this.request.current.value.name}}
 *
 *     <input value={{this.id}} {{on 'input' this.updateId}}>
 *   </template>
 * }
 * ```
 */
export function trackedFunction<Return>(
  fn: (meta: {
    /**
     * true when state.retry() is called, false initially
     * and also false when tracked data changes (new initial)
     */
    isRetrying: boolean;
  }) => Return
): State<Return>;

/**
 * Any tracked data accessed in a tracked function _before_ an `await`
 * will "entangle" with the function -- we can call these accessed tracked
 * properties, the "tracked prelude". If any properties within the tracked
 * payload  change, the function will re-run.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 * import { trackedFunction }  from 'reactiveweb/function';
 *
 * class Demo extends Component {
 *   @tracked id = 1;
 *
 *   request = trackedFunction(this, async () => {
 *     let response = await fetch(`https://swapi.dev/api/people/${this.id}`);
 *     let data = await response.json();
 *
 *     return data; // { name: 'Luke Skywalker', ... }
 *   });
 *
 *   updateId = (event) => this.id = event.target.value;
 *
 *   // Renders "Luke Skywalker"
 *   <template>
 *     {{this.request.value.name}}
 *
 *     <input value={{this.id}} {{on 'input' this.updateId}}>
 *   </template>
 * }
 * ```
 * _Note_, this example uses the proposed `<template>` syntax from the [First-Class Component Templates RFC][rfc-799]
 *
 * Also note that after an `await`, the `this` context should not be accessed as it could lead to
 * destruction/timing issues.
 *
 * [rfc-799]: https://github.com/emberjs/rfcs/pull/779
 *
 * @param {Object} context destroyable parent, e.g.: component instance aka "this"
 * @param {Function} fn the function to run with the return value available on .value
 */
export function trackedFunction<Return>(
  context: object,
  fn: (meta: {
    /**
     * true when state.retry() is called, false initially
     * and also false when tracked data changes (new initial)
     */
    isRetrying: boolean;
  }) => Return
): State<Return>;

export function trackedFunction<Return>(
  ...args: Parameters<typeof directTrackedFunction<Return>> | Parameters<typeof classUsable<Return>>
): State<Return> {
  if (args.length === 1) {
    return classUsable(...args);
  }

  if (args.length === 2) {
    return directTrackedFunction(...args);
  }

  assert('Unknown arity: trackedFunction must be called with 1 or 2 arguments');
}

const START = Symbol.for('__reactiveweb_trackedFunction__START__');

function classUsable<Return>(fn: (meta: CallbackMeta) => Return) {
  const state = new State(fn);

  let destroyable = resource<State<Return>>(() => {
    state[START]();

    return state;
  });

  associateDestroyableChild(destroyable, state);

  return destroyable;
}

function directTrackedFunction<Return>(context: object, fn: (meta: CallbackMeta) => Return) {
  const state = new State(fn);

  let destroyable = resource<State<Return>>(context, () => {
    state[START]();

    return state;
  });

  associateDestroyableChild(destroyable, state);

  return destroyable;
}

/**
 * State container that represents the asynchrony of a `trackedFunction`
 */
export class State<Value> {
  @tracked declare promise: Value;

  /**
   * ember-async-data doesn't catch errors,
   * so we can't rely on it to protect us from "leaky errors"
   * during rendering.
   *
   * See also: https://github.com/qunitjs/qunit/issues/1736
   */
  @tracked caughtError: unknown;

  #fn: (meta: CallbackMeta) => Value;

  constructor(fn: (meta: CallbackMeta) => Value) {
    this.#fn = fn;
  }

  get #state(): PromiseState<Value> {
    return getPromiseState(this.promise);
  }

  get state(): 'PENDING' | 'RESOLVED' | 'REJECTED' | 'UNSTARTED' {
    if (this.#state.isLoading) {
      return 'PENDING';
    }

    if (this.#state.resolved) {
      return 'RESOLVED';
    }

    if (this.#state.error) {
      return 'REJECTED';
    }

    return 'UNSTARTED';
  }

  /**
   * Initially true, and remains true
   * until the underlying promise resolves or rejects.
   */
  get isPending() {
    return this.#state.isLoading ?? false;
  }

  /**
   * Alias for `isResolved || isRejected`
   */
  get isFinished() {
    return this.isResolved || this.isRejected;
  }

  /**
   * Alias for `isFinished`
   * which is in turn an alias for `isResolved || isRejected`
   */
  get isSettled() {
    return this.isFinished;
  }

  /**
   * Alias for `isPending`
   */
  get isLoading() {
    return this.isPending;
  }

  /**
   * When true, the function passed to `trackedFunction` has resolved
   */
  get isResolved() {
    return Boolean(this.#state.resolved) ?? false;
  }

  /**
   * Alias for `isRejected`
   */
  get isError() {
    return this.isRejected;
  }

  /**
   * When true, the function passed to `trackedFunction` has errored
   */
  get isRejected() {
    return Boolean(this.#state.error ?? this.caughtError ?? false);
  }

  /**
   * this.data may not exist yet.
   *
   * Additionally, prior iterations of TrackedAsyncData did
   * not allow the accessing of data before
   * .state === 'RESOLVED'  (isResolved).
   *
   * From a correctness standpoint, this is perfectly reasonable,
   * as it forces folks to handle the states involved with async functions.
   *
   * The original version of `trackedFunction` did not use TrackedAsyncData,
   * and did not have these strictnesses upon property access, leaving folks
   * to be as correct or as fast/prototype-y as they wished.
   *
   * For now, `trackedFunction` will retain that flexibility.
   */
  get value(): Awaited<Value> | null {
    if (this.isResolved) {
      // This is sort of a lie, but it ends up working out due to
      // how promises chain automatically when awaited
      return this.#state.resolved as Awaited<Value>;
    }

    return null;
  }

  /**
   * When the function passed to `trackedFunction` throws an error,
   * that error will be the value returned by this property
   */
  get error() {
    if (this.state === 'UNSTARTED' && this.caughtError) {
      return this.caughtError;
    }

    if (this.state !== 'REJECTED') {
      return null;
    }

    if (this.caughtError) {
      return this.caughtError;
    }

    return this.#state.error ?? null;
  }

  async [START]() {
    try {
      let promise = this._dangerousRetry({ isRetrying: false });

      await waitForPromise(promise);
    } catch (e) {
      if (isDestroyed(this) || isDestroying(this)) return;
      this.caughtError = e;
    }
  }

  /**
   * Will re-invoke the function passed to `trackedFunction`
   * this will also re-set some properties on the `State` instance.
   * This is the same `State` instance as before, as the `State` instance
   * is tied to the `fn` passed to `trackedFunction`
   *
   * `error` or `resolvedValue` will remain as they were previously
   * until this promise resolves, and then they'll be updated to the new values.
   */
  retry = async () => {
    try {
      /**
       * This function has two places where it can error:
       * - immediately when inovking `fn` (where auto-tracking occurs)
       * - after an await, "eventually"
       */
      let promise = this._dangerousRetry({ isRetrying: true });

      await waitForPromise(promise);
    } catch (e) {
      if (isDestroyed(this) || isDestroying(this)) return;
      this.caughtError = e;
    }
  };

  _dangerousRetry = async ({ isRetrying }: CallbackMeta) => {
    if (isDestroyed(this) || isDestroying(this)) return;

    // We need to invoke this before going async so that tracked properties are consumed (entangled with) synchronously
    this.promise = this.#fn({ isRetrying });

    // TrackedAsyncData interacts with tracked data during instantiation.
    // We don't want this internal state to entangle with `trackedFunction`
    // so that *only* the tracked data in `fn` can be entangled.
    await Promise.resolve();
    if (isDestroyed(this) || isDestroying(this)) return;

    /**
     * Before we await to start a new request, let's clear our error.
     * This is detached from the tracking frame (via the above await),
     * se the UI can update accordingly, without causing us to refetch
     */
    this.caughtError = null;

    return this.promise;
  };
}
