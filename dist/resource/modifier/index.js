import { assert } from '@ember/debug';
import { setModifierManager } from '@ember/modifier';
import { resourceFactory } from 'ember-resources';
import FunctionBasedModifierManager from './manager.js';

// Provide a singleton manager.
const MANAGER = new FunctionBasedModifierManager();

/**
 * A resource-based API for building modifiers.
 *
 * You can attach this to an element, and use a `resource` to manage
 * the state, add event listeners, remove event listeners on cleanup, etc.
 *
 * Using resources for modifiers provides a clear and concise API with
 * easy to read concerns.
 *
 *
 * The signature for the modifier here is _different_ from `ember-modifier`, where positional args and named args are grouped together into an array and object respectively.

 * This signature for ember-resource's `modifier` follows the [plain function invocation](https://blog.emberjs.com/plain-old-functions-as-helpers/) signature.
 *
 * ```js
 * import { resource } from 'ember-resources';
 * import { modifier } from 'reactiveweb/resource/modifier';
 *
 * const wiggle = modifier((element, arg1, arg2, namedArgs) => {
 *     return resource(({ on }) => {
 *         let animation = element.animate([
 *             { transform: `translateX(${arg1}px)` },
 *             { transform: `translateX(-${arg2}px)` },
 *         ], {
 *             duration: 100,
 *             iterations: Infinity,
 *         });
 *
 *         on.cleanup(() => animation.cancel());
 *     });
 * });
 *
 * <template>
 *     <div {{wiggle 2 5 named="hello"}}>hello</div>
 * </template>
 * ```
 *
 */

/**
 * A resource-based API for building modifiers.
 *
 * You can attach this to an element, and use a `resource` to manage
 * the state, add event listeners, remove event listeners on cleanup, etc.
 *
 * Using resources for modifiers provides a clear and concise API with
 * easy to read concerns.
 *
 *
 * The signature for the modifier here is _different_ from `ember-modifier`, where positional args and named args are grouped together into an array and object respectively.

 * This signature for ember-resource's `modifier` follows the [plain function invocation](https://blog.emberjs.com/plain-old-functions-as-helpers/) signature.
 *
 * ```js
 * import { resource } from 'ember-resources';
 * import { modifier } from 'reactiveweb/resource/modifier';
 *
 * const wiggle = modifier((element, arg1, arg2, namedArgs) => {
 *     return resource(({ on }) => {
 *         let animation = element.animate([
 *             { transform: `translateX(${arg1}px)` },
 *             { transform: `translateX(-${arg2}px)` },
 *         ], {
 *             duration: 100,
 *             iterations: Infinity,
 *         });
 *
 *         on.cleanup(() => animation.cancel());
 *     });
 * });
 *
 * <template>
 *     <div {{wiggle 2 5 named="hello"}}>hello</div>
 * </template>
 * ```
 *
 */

/**
 * A resource-based API for building modifiers.
 *
 * You can attach this to an element, and use a `resource` to manage
 * the state, add event listeners, remove event listeners on cleanup, etc.
 *
 * Using resources for modifiers provides a clear and concise API with
 * easy to read concerns.
 *
 *
 * The signature for the modifier here is _different_ from `ember-modifier`, where positional args and named args are grouped together into an array and object respectively.

 * This signature for ember-resource's `modifier` follows the [plain function invocation](https://blog.emberjs.com/plain-old-functions-as-helpers/) signature.
 *
 * ```js
 * import { resource } from 'ember-resources';
 * import { modifier } from 'reactiveweb/resource/modifier';
 *
 * const wiggle = modifier((element, arg1, arg2, namedArgs) => {
 *     return resource(({ on }) => {
 *         let animation = element.animate([
 *             { transform: `translateX(${arg1}px)` },
 *             { transform: `translateX(-${arg2}px)` },
 *         ], {
 *             duration: 100,
 *             iterations: Infinity,
 *         });
 *
 *         on.cleanup(() => animation.cancel());
 *     });
 * });
 *
 * <template>
 *     <div {{wiggle 2 5 named="hello"}}>hello</div>
 * </template>
 * ```
 *
 */

/**
 * A resource-based API for building modifiers.
 *
 * You can attach this to an element, and use a `resource` to manage
 * the state, add event listeners, remove event listeners on cleanup, etc.
 *
 * Using resources for modifiers provides a clear and concise API with
 * easy to read concerns.
 *
 *
 * The signature for the modifier here is _different_ from `ember-modifier`, where positional args and named args are grouped together into an array and object respectively.

 * This signature for ember-resource's `modifier` follows the [plain function invocation](https://blog.emberjs.com/plain-old-functions-as-helpers/) signature.
 *
 * ```js
 * import { resource } from 'ember-resources';
 * import { modifier } from 'reactiveweb/resource/modifier';
 *
 * const wiggle = modifier((element, arg1, arg2, namedArgs) => {
 *     return resource(({ on }) => {
 *         let animation = element.animate([
 *             { transform: `translateX(${arg1}px)` },
 *             { transform: `translateX(-${arg2}px)` },
 *         ], {
 *             duration: 100,
 *             iterations: Infinity,
 *         });
 *
 *         on.cleanup(() => animation.cancel());
 *     });
 * });
 *
 * <template>
 *     <div {{wiggle 2 5 named="hello"}}>hello</div>
 * </template>
 * ```
 *
 */

function modifier(fn) {
  assert(`modifier() must be invoked with a function`, typeof fn === 'function');
  setModifierManager(() => MANAGER, fn);
  resourceFactory(fn);
  return fn;
}

/**
 * @internal
 */

export { modifier };
//# sourceMappingURL=index.js.map
