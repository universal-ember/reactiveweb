import { cell, resource } from 'ember-resources';

/**
 * A utility for debouncing high-frequency updates.
 * The returned value will only be updated every `delay` ms and is
 * initially undefined.
 *
 * This can be useful when a user's typing is updating a tracked
 * property and you want to derive data less frequently than on
 * each keystroke.
 *
 * Note that this utility requires the `@use` decorator
 * (debounce could be implemented without the need for the `@use` decorator
 * but the current implementation is 8 lines)
 *
 * @example
 * ```js
 *  import Component from '@glimmer/component';
 *  import { tracked } from '@glimmer/tracking';
 *  import { debounce } from 'reactiveweb/debounce';
 *
 *  const delay = 100; // delay in ms
 *
 *  class Demo extends Component {
 *    @tracked userInput = '';
 *
 *    @use debouncedInput = debounce(delay, () => this.userInput);
 *  }
 * ```
 *
 * @example
 * This could be further composed with RemoteData
 * ```js
 *  import Component from '@glimmer/component';
 *  import { tracked } from '@glimmer/tracking';
 *  import { debounce } from 'reactiveweb/debounce';
 *  import { RemoteData } from 'reactiveweb/remote-data';
 *
 *  const delay = 100; // delay in ms
 *
 *  class Demo extends Component {
 *    @tracked userInput = '';
 *
 *    @use debouncedInput = debounce(delay, () => this.userInput);
 *
 *    @use search = RemoteData(() => `https://my.domain/search?q=${this.debouncedInput}`);
 *  }
 * ```
 *
 * @param delay A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param callback A function to be executed after delay milliseconds.
 */
export function debounce<Value = unknown>(delay: number, callback: () => Value) {
  let lastValue: Value;
  let timer: number;
  let state = cell<Value>();

  return resource(({ on }) => {
    lastValue = callback();

    on.cleanup(() => clearTimeout(timer));
    timer = setTimeout(() => (state.current = lastValue), delay);

    return state.current;
  });
}
