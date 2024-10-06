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
export declare const ReactiveImage: ((maybeUrl: string | (() => string)) => {
    readonly isError: boolean;
    readonly value: unknown;
    readonly isResolved: boolean;
    readonly isLoading: boolean;
}) | (() => {
    readonly isError: boolean;
    readonly value: unknown;
    readonly isResolved: boolean;
    readonly isLoading: boolean;
});
//# sourceMappingURL=image.d.ts.map