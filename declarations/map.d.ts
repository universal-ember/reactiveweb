/**
 * Public API of the return value of the [[map]] utility.
 */
export interface MappedArray<Elements extends readonly unknown[], MappedTo> {
    /**
     * Array-index access to specific mapped data.
     *
     * If the map function hasn't ran yet on the source data, it will be ran, an cached
     * for subsequent accesses.
     *
     * ```js
     *  class Foo {
     *    myMappedData = map(this, {
     *      data: () => [1, 2, 3],
     *      map: (num) => `hi, ${num}!`
     *    });
     *
     *    get first() {
     *      return this.myMappedData[0];
     *    }
     *  }
     * ```
     */
    [index: number]: MappedTo;
    /**
     * evaluate and return an array of all mapped items.
     *
     * This is useful when you need to do other Array-like operations
     * on the mapped data, such as filter, or find
     *
     * ```js
     *  class Foo {
     *    myMappedData = map(this, {
     *      data: () => [1, 2, 3],
     *      map: (num) => `hi, ${num}!`
     *    });
     *
     *    get everything() {
     *      return this.myMappedData.values();
     *    }
     *  }
     * ```
     */
    values: () => {
        [K in keyof Elements]: MappedTo;
    };
    /**
     * Without evaluating the map function on each element,
     * provide the total number of elements
     *
     * ```js
     *  class Foo {
     *    myMappedData = map(this, {
     *      data: () => [1, 2, 3],
     *      map: (num) => `hi, ${num}!`
     *    });
     *
     *    get numItems() {
     *      return this.myMappedData.length;
     *    }
     *  }
     * ```
     */
    length: number;
    /**
     * Iterate over the mapped array, lazily invoking the passed map function
     * that was passed to [[map]].
     *
     * This will always return previously mapped records without re-evaluating
     * the map function, so the default `{{#each}}` behavior in ember will
     * be optimized on "object-identity". e.g.:
     *
     * ```js
     *  // ...
     *  myMappedData = map(this, {
     *    data: () => [1, 2, 3],
     *    map: (num) => `hi, ${num}!`
     *  });
     *  // ...
     * ```
     * ```hbs
     *  {{#each this.myMappedData as |datum|}}
     *     loop body only invoked for changed entries
     *     {{datum}}
     *  {{/each}}
     * ```
     *
     * Iteration in javascript is also provided by this iterator
     * ```js
     *  class Foo {
     *    myMappedData = map(this, {
     *      data: () => [1, 2, 3],
     *      map: (num) => `hi, ${num}!`
     *    });
     *
     *    get mapAgain() {
     *      let results = [];
     *
     *      for (let datum of this.myMappedData) {
     *        results.push(datum);
     *      }
     *
     *      return datum;
     *    }
     *  }
     * ```
     */
    [Symbol.iterator](): Iterator<MappedTo>;
}
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
export declare function map<Elements extends readonly unknown[], MapTo = unknown>(
/**
 * parent destroyable context, usually `this`
 */
destroyable: object, options: {
    /**
     * Array of non-primitives to map over
     *
     * This can be class instances, plain objects, or anything supported by WeakMap's key
     */
    data: () => Elements;
    /**
     * How to transform each element from `data`,
     * similar to if you were to use Array map yourself.
     *
     * This function will be called only when needed / on-demand / lazily.
     * - if iterating over part of the data, map will only be called for the elements observed
     * - if not iterating, map will only be called for the elements observed.
     */
    map: (element: Elements[0]) => MapTo;
}): MappedArray<Elements, MapTo>;
declare const AT = "__AT__";
/**
 * @private
 */
export declare class TrackedArrayMap<Element = unknown, MappedTo = unknown> implements MappedArray<Element[], MappedTo> {
    [index: number]: MappedTo;
    private _mapCache;
    private _dataFn;
    private _mapper;
    constructor(owner: object, data: () => readonly Element[], map: (element: Element) => MappedTo);
    get _records(): (Element & object)[];
    values: () => MappedTo[];
    get length(): number;
    [Symbol.iterator](): Iterator<MappedTo>;
    /**
     * @private
     *
     * don't conflict with
     *   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
     */
    [AT]: (i: number) => MappedTo;
}
export {};
//# sourceMappingURL=map.d.ts.map