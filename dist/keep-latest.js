import { resourceFactory, resource } from 'ember-resources';

const isEmpty = x => {
  if (Array.isArray(x)) {
    return x.length === 0;
  }
  if (typeof x === 'object') {
    if (x === null) return true;
    return Object.keys(x).length === 0;
  }
  return x !== 0 && !x;
};
/**
 * A utility decorator for smoothing out changes in upstream data between
 * refreshes / reload.
 *
 * @example
 * when using RemoteData (or some other promise-based "eventually a value" resource),
 * the value returned from the API is what's useful to see to users. But if the URL
 * changes, the remote request will start anew, and isLoading becomes true, and the value is falsey until the request finishes. This can result in some flicker
 * until the new request finishes.
 *
 * To smooth that out, we can use [[keepLatest]]
 *
 * ```js
 *  import { RemoteData } from 'reactiveweb/remote-data';
 *  import { keepLatest } from 'reactiveweb/keep-latest';
 *
 *  class A {
 *    @use request = RemoteData(() => 'some url');
 *    @use data = keepLatest({
 *      value: () => this.request.value,
 *      when: () => this.request.isLoading,
 *    });
 *
 *    get result() {
 *      // after the initial request, this is always resolved
 *      return this.data;
 *    }
 *  }
 * ```
 *
 * To specify a default value, use an additional getter
 * ```js
 *  import { RemoteData } from 'reactiveweb/remote-data';
 *  import { keepLatest } from 'reactiveweb/keep-latest';
 *
 *  class A {
 *    @use request = RemoteData(() => 'some url');
 *    @use data = keepLatest({
 *      value: () => this.request.value,
 *      when: () => this.request.isLoading,
 *    });
 *
 *    get latest() {
 *      // after the initial request, this is always resolved
 *      return this.data;
 *    }
 *
 *    get result() {
 *      return this.latest ?? { default: 'value' };
 *    }
 *  }
 * ```
 */
function keepLatest({
  when,
  value: valueFn
}) {
  return resource(() => {
    let previous;
    let initial = true;
    return () => {
      let value = valueFn();
      if (when()) {
        /**
         * Initially, if we may as well return the value instead
         * of the "previous" value is there is no previous yet.
         *
         * We check against undefined, because that's what
         * `previous` is "initialized" to.
         *
         * And then we never enter this block again, because
         * we will have previous values in future invocations of this
         * Formula.
         */
        if (previous === undefined && initial) {
          initial = false;
          return value;
        }
        return previous = isEmpty(value) ? previous : value;
      }
      return previous = value;
    };
  });
}
resourceFactory(keepLatest);

export { keepLatest };
//# sourceMappingURL=keep-latest.js.map
