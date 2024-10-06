import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { isDestroyed, isDestroying, destroy, associateDestroyableChild } from '@ember/destroyable';
import { TrackedAsyncData } from 'ember-async-data';
import { resource } from 'ember-resources';
import { g, i } from 'decorator-transforms/runtime';

function trackedFunction(...args) {
  if (args.length === 1) {
    return classUsable(...args);
  }
  if (args.length === 2) {
    return directTrackedFunction(...args);
  }
  assert('Unknown arity: trackedFunction must be called with 1 or 2 arguments');
}
function classUsable(fn) {
  const state = new State(fn);
  let destroyable = resource(() => {
    state.retry();
    return state;
  });
  associateDestroyableChild(destroyable, state);
  return destroyable;
}
function directTrackedFunction(context, fn) {
  const state = new State(fn);
  let destroyable = resource(context, () => {
    state.retry();
    return state;
  });
  associateDestroyableChild(destroyable, state);
  return destroyable;
}

/**
 * State container that represents the asynchrony of a `trackedFunction`
 */
class State {
  static {
    g(this.prototype, "data", [tracked], function () {
      return null;
    });
  }
  #data = (i(this, "data"), void 0);
  static {
    g(this.prototype, "promise", [tracked]);
  }
  #promise = (i(this, "promise"), void 0);
  static {
    g(this.prototype, "caughtError", [tracked]);
  }
  #caughtError = (i(this, "caughtError"), void 0);
  /**
   * ember-async-data doesn't catch errors,
   * so we can't rely on it to protect us from "leaky errors"
   * during rendering.
   *
   * See also: https://github.com/qunitjs/qunit/issues/1736
   */
  #fn;
  constructor(fn) {
    this.#fn = fn;
  }
  get state() {
    return this.data?.state ?? 'UNSTARTED';
  }

  /**
   * Initially true, and remains true
   * until the underlying promise resolves or rejects.
   */
  get isPending() {
    if (!this.data) return true;
    return this.data.isPending ?? false;
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
    return this.data?.isResolved ?? false;
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
    return this.data?.isRejected ?? Boolean(this.caughtError) ?? false;
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
  get value() {
    if (this.data?.isResolved) {
      // This is sort of a lie, but it ends up working out due to
      // how promises chain automatically when awaited
      return this.data.value;
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
    if (this.data?.state !== 'REJECTED') {
      return null;
    }
    if (this.caughtError) {
      return this.caughtError;
    }
    return this.data?.error ?? null;
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
      await this._dangerousRetry();
    } catch (e) {
      if (isDestroyed(this) || isDestroying(this)) return;
      this.caughtError = e;
    }
  };
  _dangerousRetry = async () => {
    if (isDestroyed(this) || isDestroying(this)) return;

    // We've previously had data, but we're about to run-again.
    // we need to do this again so `isLoading` goes back to `true` when re-running.
    // NOTE: we want to do this _even_ if this.data is already null.
    //       it's all in the same tracking frame and the important thing is taht
    //       we can't *read* data here.
    this.data = null;

    // this._internalError = null;

    // We need to invoke this before going async so that tracked properties are consumed (entangled with) synchronously
    this.promise = this.#fn();

    // TrackedAsyncData interacts with tracked data during instantiation.
    // We don't want this internal state to entangle with `trackedFunction`
    // so that *only* the tracked data in `fn` can be entangled.
    await Promise.resolve();

    /**
     * Before we await to start a new request, let's clear our error.
     * This is detached from the tracking frame (via the above await),
     * se the UI can update accordingly, without causing us to refetch
     */
    this.caughtError = null;
    if (this.data) {
      let isUnsafe = isDestroyed(this.data) || isDestroying(this.data);
      if (!isUnsafe) {
        destroy(this.data);
        this.data = null;
      }
    }
    if (isDestroyed(this) || isDestroying(this)) return;

    // TrackedAsyncData manages the destroyable child association for us
    this.data = new TrackedAsyncData(this.promise);
    return this.promise;
  };
}

export { State, trackedFunction };
//# sourceMappingURL=function.js.map
