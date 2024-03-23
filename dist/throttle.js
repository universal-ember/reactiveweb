import { cell, resource } from 'ember-resources';

/**
 * A utility that creates a resource allowing us to throttle execution of a function.
 * Especially useful for rate limiting execution of handlers on events like resize and scroll.
 *
 * ```js
 *  import Component from '@glimmer/component';
 *  import { tracked } from '@glimmer/tracking';
 *  import { use } from 'ember-resources';
 *  import { throttle } from 'reactiveweb/throttle';
 *
 *  class Demo extends Component {
 *    @tracked _userInput = 'initial';
 *
 *    // immediately returns 'initial', and all updates will be throttled
 *    // to update only after 100ms since the last value was detected.
 *    @use userInput  = throttle(100, () => this._userInput);
 * ```
 *
 * @param delay A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param callback A function to be executed after delay milliseconds.
 */
function throttle(delay, callback) {
  const state = cell();
  let last;
  return resource(({
    on
  }) => {
    let timer;
    on.cleanup(() => clearTimeout(timer));
    timer = setTimeout(() => state.current = callback(), delay);
    last = last ?? callback();
    return state.current ?? last;
  });
}

export { throttle };
//# sourceMappingURL=throttle.js.map
