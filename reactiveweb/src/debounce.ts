import { tracked } from '@glimmer/tracking';

import { resource } from 'ember-resources';

class TrackedValue<T> {
  @tracked value: T | undefined;
}

/**
 * A utility for debouncing high-frequency updates.
 * The returned value will only be updated every `ms` and is
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
 * @param {number} ms delay in milliseconds to wait before updating the returned value
 * @param {() => Value} thunk function that returns the value to debounce
 */
export function debounce<Value = unknown>(ms: number, thunk: () => Value, debounceInitialValue = true) {
  let lastValue: Value;
  let timer: number;
  let state = new TrackedValue<Value>();

  /**
   * Whether the initial value has been returned inmediately or not
   */
  let initialValueReturned = debounceInitialValue;

  return resource(({ on }) => {
    lastValue = thunk();

    if (!initialValueReturned) {
      state.value = lastValue;
      initialValueReturned = true;
    } else {
      on.cleanup(() => timer && clearTimeout(timer));
      timer = setTimeout(() => (state.value = lastValue), ms);
    }

    return state.value;
  });
}
