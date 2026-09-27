import type { Class, Stage1Decorator } from '#types';
type NonKey<K> = K extends string ? never : K extends symbol ? never : K;
/**
 * A util to abstract away the boilerplate of linking of "things" with an owner
 * and making them destroyable.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { link } from 'reactiveweb/link';
 *
 * class MyClass {  ... }
 *
 * export default class Demo extends Component {
 *   @link(MyClass) myInstance;
 * }
 * ```
 */
export declare function link<Instance>(child: Class<Instance>): Stage1Decorator;
/**
 * A util to abstract away the boilerplate of linking of "things" with an owner
 * and making them destroyable.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { cached } from '@glimmer/tracking';
 * import { link } from 'reactiveweb/link';
 *
 * export default class Demo extends Component {
 *   @cached
 *   get myFunction() {
 *     let instance = new MyClass(this.args.foo);
 *
 *     return link(instance, this);
 *   }
 * }
 * ```
 *
 * NOTE: If args change, as in this example, memory pressure will increase,
 *       as the linked instance will be held on to until the host object is destroyed.
 */
export declare function link<Child, Other>(child: Child, parent: NonKey<Other>): Child;
/**
 * A util to abstract away the boilerplate of linking of "things" with an owner
 * and making them destroyable.
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { link } from 'reactiveweb/link';
 *
 * class MyClass {  ... }
 *
 * export default class Demo extends Component {
 *   @link myInstance = new MyClass();
 * }
 * ```
 *
 * NOTE: reactive args may not be passed to `MyClass` directly if you wish updates to be observed.
 *   A way to use reactive args is this:
 *
 * ```js
 * import Component from '@glimmer/component';
 * import { tracked } from '@glimmer/tracking';
 * import { link } from 'reactiveweb/link';
 *
 * class MyClass {  ... }
 *
 * export default class Demo extends Component {
 *   @tracked foo = 'bar';
 *
 *   @link myInstance = new MyClass({
 *      foo: () => this.args.foo,
 *      bar: () => this.bar,
 *   });
 * }
 * ```
 *
 * This way, whenever foo() or bar() is invoked within `MyClass`,
 * only the thing that does that invocation will become entangled with the tracked data
 * referenced within those functions.
 */
export declare function link(...args: Parameters<Stage1Decorator>): void;
export {};
//# sourceMappingURL=link.d.ts.map