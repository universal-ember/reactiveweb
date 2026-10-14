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
export declare function task<Return = unknown, Args extends unknown[] = unknown[], LocalTask extends TaskIsh<Args, Return> = TaskIsh<Args, Return>>(context: object, task: LocalTask, thunk?: () => Args): TaskInstance<Return>;
export declare const trackedTask: typeof task;
export type TaskReturnType<T> = T extends TaskIsh<any, infer Return> ? Return : unknown;
export type TaskArgsType<T> = T extends TaskIsh<infer Args, any> ? Args : unknown[];
export interface TaskIsh<Args extends any[], Return> {
    perform: (...args: Args) => TaskInstance<Return>;
    cancelAll: () => void;
}
/**
 * @private
 *
 * Need to define this ourselves, because between
 * ember-concurrency 1, 2, -ts, decorators, etc
 * there are 5+ ways the task type is defined
 *
 * https://github.com/machty/ember-concurrency/blob/f53656876748973cf6638f14aab8a5c0776f5bba/addon/index.d.ts#L280
 */
export interface TaskInstance<Return = unknown> extends Promise<Return> {
    readonly value: Return | null;
    readonly error: unknown;
    readonly isSuccessful: boolean;
    readonly isError: boolean;
    readonly isCanceled: boolean;
    readonly hasStarted: boolean;
    readonly isFinished: boolean;
    readonly isRunning: boolean;
    readonly isDropped: boolean;
    cancel(reason?: string): void | Promise<void>;
}
/**
 * @private
 */
export declare const TASK: unique symbol;
declare const RUN: unique symbol;
/**
 * @private
 */
export declare class State<Args extends any[], Return, LocalTask extends TaskIsh<Args, Return>> {
    [TASK]: LocalTask;
    constructor(task: LocalTask);
    currentTask: TaskInstance<Return>;
    lastTask: TaskInstance<Return> | undefined;
    get value(): Return | null | undefined;
    [RUN]: (positional: Args) => void;
}
export {};
//# sourceMappingURL=ember-concurrency.d.ts.map