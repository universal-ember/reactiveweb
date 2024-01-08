import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty, c as _classPrivateFieldInitSpec, b as _defineProperty, d as _classPrivateFieldSet, e as _classPrivateFieldGet } from './_rollupPluginBabelHelpers-6coJD1QH.js';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { associateDestroyableChild, isDestroyed, isDestroying, destroy } from '@ember/destroyable';
import { TrackedAsyncData } from 'ember-async-data';
import { resource } from 'ember-resources';

var _class, _descriptor, _descriptor2, _fn;

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
 * const Request = resourceFactory((idFn) => {
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
 * });
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
let State = (_class = (_fn = /*#__PURE__*/new WeakMap(), class State {
  constructor(fn) {
    _initializerDefineProperty(this, "data", _descriptor, this);
    _initializerDefineProperty(this, "promise", _descriptor2, this);
    _classPrivateFieldInitSpec(this, _fn, {
      writable: true,
      value: void 0
    });
    /**
     * Will re-invoke the function passed to `trackedFunction`
     * this will also re-set some properties on the `State` instance.
     * This is the same `State` instance as before, as the `State` instance
     * is tied to the `fn` passed to `trackedFunction`
     *
     * `error` or `resolvedValue` will remain as they were previously
     * until this promise resolves, and then they'll be updated to the new values.
     */
    _defineProperty(this, "retry", async () => {
      if (isDestroyed(this) || isDestroying(this)) return;

      // We've previously had data, but we're about to run-again.
      // we need to do this again so `isLoading` goes back to `true` when re-running.
      // NOTE: we want to do this _even_ if this.data is already null.
      //       it's all in the same tracking frame and the important thing is taht
      //       we can't *read* data here.
      this.data = null;

      // We need to invoke this before going async so that tracked properties are consumed (entangled with) synchronously
      this.promise = _classPrivateFieldGet(this, _fn).call(this);

      // TrackedAsyncData interacts with tracked data during instantiation.
      // We don't want this internal state to entangle with `trackedFunction`
      // so that *only* the tracked data in `fn` can be entangled.
      await Promise.resolve();
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
    });
    _classPrivateFieldSet(this, _fn, fn);
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
    return this.data?.isRejected ?? false;
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
    return this.data?.error ?? null;
  }
}), (_descriptor = _applyDecoratedDescriptor(_class.prototype, "data", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: function () {
    return null;
  }
}), _descriptor2 = _applyDecoratedDescriptor(_class.prototype, "promise", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class);

export { State, trackedFunction };
//# sourceMappingURL=function.js.map
