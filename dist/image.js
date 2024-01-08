import { resourceFactory, resource } from 'ember-resources';
import { trackedFunction } from './function.js';

/**
 * Reactively load an Image with access to loading / error state.
 *
 * Usage in a component
 * ```gjs
 * import { ReactiveImage } from 'reactiveweb/image';
 * <template>
 *   {{#let (ReactiveImage 'https://path.to.image') as |state|}}
 *      {{#if imgState.isResolved}}
 *        <img src={{imgState.value}}>
 *      {{/if}}
 *   {{/let}}
 * </template>
 * ```
 *
 * Usage in a class
 * ```js
 * import { use } from 'ember-resources';
 * import { ReactiveImage } from 'reactiveweb/image';
 *
 * class Demo {
 *   @use imageState = ReactiveImage('https://path.to.image');
 * }
 * ```
 *
 * Reactive usage in a class
 * ```js
 * import { tracked } from '@glimmer/tracking';
 * import { use } from 'ember-resources';
 * import { ReactiveImage } from 'reactiveweb/image';
 *
 * class Demo {
 *   @tracked url = '...';
 *   @use imageState = ReactiveImage(() => this.url);
 * }
 * ```
 */
const ReactiveImage = resourceFactory(maybeUrl => {
  return resource(({
    use
  }) => {
    const readonlyReactive = use(trackedFunction(async () => {
      /**
       * NOTE: Image#onerror is a global error.
       *       So in testing, the error escapes the confines
       *       of this promise handler (trackedFunction)
       *
       * We need to "swallow the rejection" and re-throw
       * by wrapping in an extra promise.
       */
      const image = new window.Image();
      const url = typeof maybeUrl === 'function' ? maybeUrl() : maybeUrl;
      function loadImage() {
        /**
         * Note tha lack of reject callback.
         * This is what allows us to capture "global errors"
         * thrown by image.onerror
         *
         * Additionally, the global error does not have a stack trace.
         * And we want to provide a stack trace for easier debugging.
         *
         */
        return new Promise(resolve => {
          image.onload = resolve;

          /**
           * The error passed to onerror doesn't look that useful.
           *  But we'll log it just in case.
           *
           */
          image.onerror = error => {
            console.error(`Image failed to load at ${url}`, error);

            /**
             * If we use real reject, we cause an un-catchable error
             */
            resolve('soft-rejected');
          };
          image.src = url;
        });
      }
      return await loadImage();
    }));

    /**
     * Here we both forward the state of trackedFunction
     * as well as re-define how we want to determine what isError, value, and isResolved
     * mean.
     *
     * This is because trackedFunction does not capture errors.
     * I believe it _should_ though, so this may be a bug.
     *
     * If it ends up being a bug in trackedFunction,
     * then we can delete all this, and only do:
     *
     * return () => readonlyReactive.current;
     */
    const isError = () => readonlyReactive.current.value === 'soft-rejected';
    return {
      get isError() {
        return isError();
      },
      get value() {
        if (isError()) return null;
        return readonlyReactive.current.value;
      },
      get isResolved() {
        if (isError()) return false;
        return readonlyReactive.current.isResolved;
      },
      get isLoading() {
        return readonlyReactive.current.isLoading;
      }
    };
  });
});

export { ReactiveImage };
//# sourceMappingURL=image.js.map
