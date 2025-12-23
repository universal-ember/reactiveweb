import { cell, resource } from 'ember-resources';

/**
 * A utility for debouncing high-frequency updates.
 * The returned value will only be updated every `ms` and is
 * initially undefined, unless an initialize value is provided.
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
 *  import { use } from 'ember-resources';
 *  import { debounce } from 'reactiveweb/debounce';
 *
 *  const delay = 100; // ms
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
 *  import { use } from 'ember-resources';
 *  import { debounce } from 'reactiveweb/debounce';
 *  import { RemoteData } from 'reactiveweb/remote-data';
 *
 *  const delay = 100; // ms
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
 * @example
 * An initialize value can be provided as the starting value instead of it initially returning undefined.
 * ```js
 *  import Component from '@glimmer/component';
 *  import { tracked } from '@glimmer/tracking';
 *  import { use } from 'ember-resources';
 *  import { debounce } from 'reactiveweb/debounce';
 *
 *  const delay = 100; // ms
 *
 *  class Demo extends Component {
 *    @tracked userInput = 'products';
 *
 *    @use debouncedInput = debounce(delay, () => this.userInput, this.userInput);
 *  }
 * ```
 *
 * @param {number} ms delay in milliseconds to wait before updating the returned value
 * @param {() => Value} thunk function that returns the value to debounce
 * @param {Value} initialize value to return initially before any debounced updates
 */
export function debounce<Value = unknown>(ms: number, thunk: () => Value, initialize?: Value) {
  let lastValue: Value | undefined = initialize;
  const state = cell<Value | undefined>(lastValue);

  return resource(({ on }) => {
    // This lint is wrong wtf
    // eslint-disable-next-line prefer-const
    let timer: number;

    lastValue = thunk();

    on.cleanup(() => {
      if (timer) {
        clearTimeout(timer);
      }
    });

    timer = setTimeout(() => {
      state.current = lastValue;
    }, ms);

    return () => state.current;
  });
}
