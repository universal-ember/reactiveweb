import { cached } from '@glimmer/tracking';
import { setOwner } from '@ember/application';
import { assert } from '@ember/debug';
import { n } from 'decorator-transforms/runtime';

/**
 * Reactivily apply a `map` function to each element in an array,
 * persisting map-results for each object, based on identity.
 *
 * This is useful when you have a large collection of items that
 * need to be transformed into a different shape (adding/removing/modifying data/properties)
 * and you want the transform to be efficient when iterating over that data.
 *
 * A common use case where this `map` utility provides benefits over is
 * ```js
 * class MyClass {\
 *   @cached
 *   get wrappedRecords() {
 *     return this.records.map(record => new SomeWrapper(record));
 *   }
 * }
 * ```
 *
 * Even though the above is `@cached`, if any tracked data accessed during the evaluation of `wrappedRecords`
 * changes, the entire array.map will re-run, often doing duplicate work for every unchanged item in the array.
 *
 * @return {MappedArray} an object that behaves like an array. This shouldn't be modified directly. Instead, you can freely modify the data returned by the `data` function, which should be tracked in order to benefit from this abstraction.
 *
 * @example
 *
 * ```js
 *  import { map } from 'reactiveweb/map';
 *
 *  class MyClass {
 *    wrappedRecords = map(this, {
 *      data: () => this.records,
 *      map: (record) => new SomeWrapper(record),
 *    }),
 *  }
 * ```
 */
function map(
/**
 * parent destroyable context, usually `this`
 */
destroyable, options) {
  let {
    data,
    map
  } = options;
  return new TrackedArrayMap(destroyable, data, map);
}
const AT = '__AT__';

/**
 * @private
 */
class TrackedArrayMap {
  // Tells TS that we can array-index-access

  // these can't be real private fields
  // until @cached is a real decorator
  _mapCache = new WeakMap();
  _dataFn;
  _mapper;
  constructor(owner, data, map) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOwner(this, owner);
    this._dataFn = data;
    this._mapper = map;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    /**
     * This is what allows square-bracket index-access to work.
     *
     * Unfortunately this means the returned value is
     * Proxy -> Proxy -> wrapper object -> *then* the class instance
     *
     * Maybe JS has a way to implement array-index access, but I don't know how
     */
    return new Proxy(this, {
      get(_target, property) {
        if (typeof property === 'string') {
          let parsed = parseInt(property, 10);
          if (!isNaN(parsed)) {
            return self[AT](parsed);
          }
        }
        return self[property];
      }
      // Is there a way to do this without lying to TypeScript?
    });
  }
  get _records() {
    let data = this._dataFn();
    assert(`Every entry in the data passed to \`map\` must be an object.`, data.every(datum => typeof datum === 'object'));
    return data;
  }
  static {
    n(this.prototype, "_records", [cached]);
  }
  values = () => [...this];
  get length() {
    return this._records.length;
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        if (i >= this.length) {
          return {
            done: true,
            value: null
          };
        }
        let value = this[AT](i);
        i++;
        return {
          value,
          done: false
        };
      }
    };
  }

  /**
   * @private
   *
   * don't conflict with
   *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
   */
  [AT] = i => {
    let record = this._records[i];
    assert(`Expected record to exist at index ${i}, but it did not. ` + `The array item is expected to exist, because the map utility resource lazily iterates along the indices of the original array passed as data. ` + `This error could happen if the data array passed to map has been mutated while iterating. ` + `To resolve this error, do not mutate arrays while iteration occurs.`, record);
    let value = this._mapCache.get(record);
    if (!value) {
      value = this._mapper(record);
      this._mapCache.set(record, value);
    }
    return value;
  };
}

export { TrackedArrayMap, map };
//# sourceMappingURL=map.js.map
