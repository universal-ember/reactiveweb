import { assert } from '@ember/debug';
import { associateDestroyableChild, registerDestructor } from '@ember/destroyable';
import { get } from '@ember/object';
import { resource } from 'ember-resources';
import { normalizeThunk, DEFAULT_THUNK } from './utils.js';

/* eslint-disable ember/no-get */

/**
 * uses Resource to make ember-concurrency tasks reactive.
 *
 * -------------------------
 *
 * @note `ember-resources` does not provide or depend on ember-concurrency.
 * If you want to use task, you'll need to add ember-concurrency as a dependency
 * in your project.
 *
 * @example
 *  When `this.id` changes, the task will automatically be re-invoked.
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { restartableTask, timeout } from 'ember-concurrency';
 * import { task as trackedTask } from 'reactiveweb/ember-concurrency';
 *
 * class Demo {
 *   @tracked id = 1;
 *
 *   searchTask = restartableTask(async () => {
 *     await timeout(200);
 *     await fetch('...');
 *     return 'the-value';
 *   })
 *
 *   last = trackedTask(this, this.searchTask, () => [this.id]);
 * }
 * ```
 * ```hbs
 * Available Properties:
 *  {{this.last.value}}
 *  {{this.last.isFinished}}
 *  {{this.last.isRunning}}
 * ```
 *  (and all other properties on a [TaskInstance](https://ember-concurrency.com/api/TaskInstance.html))
 *
 *
 */
function task(context, task, thunk) {
  assert(`Task does not have a perform method. Is it actually a task?`, 'perform' in task);
  const state = new State(task);
  const destroyable = resource(context, () => {
    const args = thunk || DEFAULT_THUNK;
    const positional = normalizeThunk(args).positional;
    state[RUN](positional || []);
    return state;
  });
  associateDestroyableChild(destroyable, state);
  registerDestructor(state, () => state[TASK].cancelAll());
  return destroyable;
}
const trackedTask = task;

/**
 * @private
 *
 * Need to define this ourselves, because between
 * ember-concurrency 1, 2, -ts, decorators, etc
 * there are 5+ ways the task type is defined
 *
 * https://github.com/machty/ember-concurrency/blob/f53656876748973cf6638f14aab8a5c0776f5bba/addon/index.d.ts#L280
 */

/**
 * @private
 */
const TASK = Symbol('TASK');
const RUN = Symbol('RUN');

/**
 * @private
 */
class State {
  // Set via useTask

  constructor(task) {
    this[TASK] = task;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    /*
     * This proxy defaults to returning the underlying data on
     * the task runner when '.value' is accessed.
     *
     * When working with ember-concurrency tasks, users have the expectation
     * that they'll be able to inspect the status of the tasks, such as
     * `isRunning`, `isFinished`, etc.
     *
     * To support that, we need to proxy to the `currentTask`.
     *
     */
    return new Proxy(self, {
      get(target, key) {
        if (key === RUN) {
          return self[RUN];
        }
        const taskRunner = self;
        const instance = taskRunner.currentTask;
        if (!instance) {
          return;
        }
        if (typeof key === 'string') {
          // @ts-ignore
          get(taskRunner.currentTask, key);
        }
        if (key === 'value') {
          /**
           * getter that falls back to the previous task's value
           */
          return taskRunner.value;
        }

        // We can be thennable, but we'll want to entangle with tracked data
        if (key === 'then') {
          get(taskRunner.currentTask, 'isRunning');
        }

        /**
         * If the key is anything other than value, query on the currentTask
         */
        const value = Reflect.get(instance, key, instance);
        return typeof value === 'function' ? value.bind(instance) : value;
      }
      // ownKeys(target): (string | symbol)[] {
      //   return Reflect.ownKeys(target.value);
      // },
      // getOwnPropertyDescriptor(target, key): PropertyDescriptor | undefined {
      //   return Reflect.getOwnPropertyDescriptor(target.value, key);
      // },
    });
  }
  // Set during setup/update

  get value() {
    if (this.currentTask?.isFinished && !this.currentTask.isCanceled) {
      return this.currentTask.value;
    }
    return this.lastTask?.value;
  }
  [RUN] = positional => {
    if (this.currentTask) {
      this.lastTask = this.currentTask;
    }
    this.currentTask = this[TASK].perform(...positional);
  };
}

export { State, TASK, task, trackedTask };
//# sourceMappingURL=ember-concurrency.js.map
