/**
 * Synchronize external state.
 *
 * This should be used sparingly, if at all.
 * The purpose of this util is to provide a way to synchronize external state
 * in an auto-tracked system.
 * However, this can lead to infinite revalidation / re-rendering problems if tracked data is set within the function passed to `sync`.
 *
 * As a result, tracked data should not be set within `sync`.
 * Example usage of when you may want to use `sync`
 * ```gjs
 * import { sync } from 'reactiveweb/sync';
 * import { fn } from '@ember/helper';
 *
 * function setTitle(title) {
 *   document.title = title;
 * }
 *
 * <template>
 *   {{sync (fn setTitle "My Blog")}}
 * </template>
 * ```
 *
 * `sync` does autotrack, so accessing tracked data within the function passed to sync
 * will cause updates to be re-synced.
 *
 * ```gjs
 * import { sync } from 'reactiveweb/sync';
 * import { fn } from '@ember/helper';
 *
 * function setTitle(title) {
 *   document.title = title;
 * }
 *
 * class Demo extends Component {
 *    <template>
 *      {{sync (fn setTitle this.title)}}
 *    </template>
 *
 *    @tracked title;
 *
 *    updateTitle = (newTitle) => this.title = newTitle;
 * }
 * ```
 *
 * If setting tracked data absolutely must happen, you may want to "detach" from autotracking.
 * There are two ways to do this, depending on the timing needs of your UI.
 * - `await Promise.resolve()` -- relies on happenstance of how autotracking works
 * - `requestAnimationFrame()` -- more robust, but is delayed until the next available frame to do work in.
 *
 * In either case there are rare timing circumstances where when the synchronized code
 * _happens_ to run, it could accidentally be a part of a tracking frame. It's highly unlikely,
 * since auto-tracking is synchronous, but the probability is non-0.
 *
 * Example of detaching from auto-tracking:
 * ```gjs
 * import { sync } from 'reactiveweb/sync';
 *
 * class Demo extends Component {
 *    <template>
 *      {{sync setTitle}}
 *    </template>
 *
 *    @tracked title;
 *
 *    updateTitle = (newTitle) => this.title = newTitle;
 *
 *    // note this is an "effect" or "side-effect" and highly discouraged
 *    // in app and library code.
 *    // These tend to become "observers", which are harder to debug and
 *    // fall under the "spooky action at a distance" code smell.
 *    setTitle = async () => {
 *      await Promise.resolve();
 *
 *      // accessing before the await auto-tracks,
 *      // because auto-tracking is synchronous
 *      let title = this.title;
 *
 *      this.title = `${title}!!!!!!`;
 *    }
 * }
 * ```
 *
 */
export declare function sync(fn: () => void | Promise<void>): void;
//# sourceMappingURL=sync.d.ts.map