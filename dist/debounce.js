import { _ as _applyDecoratedDescriptor, a as _initializerDefineProperty } from './_rollupPluginBabelHelpers-6coJD1QH.js';
import { tracked } from '@glimmer/tracking';
import { resource } from 'ember-resources';

var _class, _descriptor;
let TrackedValue = (_class = class TrackedValue {
  constructor() {
    _initializerDefineProperty(this, "value", _descriptor, this);
  }
}, (_descriptor = _applyDecoratedDescriptor(_class.prototype, "value", [tracked], {
  configurable: true,
  enumerable: true,
  writable: true,
  initializer: null
})), _class);
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
function debounce(ms, thunk) {
  let lastValue;
  let timer;
  let state = new TrackedValue();
  return resource(({
    on
  }) => {
    lastValue = thunk();
    on.cleanup(() => timer && clearTimeout(timer));
    timer = setTimeout(() => state.value = lastValue, ms);
    return state.value;
  });
}

export { debounce };
//# sourceMappingURL=debounce.js.map
