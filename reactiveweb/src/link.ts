/* eslint-disable @typescript-eslint/no-explicit-any */
import { assert } from '@ember/debug';
import { associateDestroyableChild } from '@ember/destroyable';

import { compatOwner } from './-private/ember-compat.ts';

import type { Class, Stage1Decorator, Stage1DecoratorDescriptor } from '#types';

let getOwner = compatOwner.getOwner;
let setOwner = compatOwner.setOwner;

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
export function link<Instance>(child: Class<Instance>): Stage1Decorator;

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
export function link<Child, Other>(child: Child, parent: NonKey<Other>): Child;

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
export function link(...args: Parameters<Stage1Decorator>): void;

export function link(...args: any[]) {
  if (args.length === 3) {
    /**
     * Uses initializer to get the child
     */
    return linkDecorator(...(args as Parameters<Stage1Decorator>));
  }

  if (args.length === 1) {
    return linkDecoratorFactory(...(args as unknown as [any]));
  }

  // Because TS types assume property decorators might not have a descriptor,
  // we have to cast....
  return directLink(...(args as unknown as [object, object]));
}

function directLink(child: object, parent: object) {
  associateDestroyableChild(parent, child);

  let owner = getOwner(parent);

  if (owner) {
    setOwner(child, owner);
  }

  return child;
}

function linkDecoratorFactory(child: Class<unknown>) {
  return function decoratorPrep(...args: Parameters<Stage1Decorator>) {
    return linkDecorator(...args, child);
  };
}

function linkDecorator(
  _prototype: object,
  key: string | symbol,
  descriptor: Stage1DecoratorDescriptor | undefined,
  explicitChild?: Class<unknown>
): void {
  assert(`@link is a stage 1 decorator, and requires a descriptor`, descriptor);
  assert(`@link can only be used with string-keys`, typeof key === 'string');

  let { initializer } = descriptor;

  assert(
    `@link requires an initializer or be used as a decorator factory (\`@link(...))\`). For example, ` +
      `\`@link foo = new MyClass();\` or \`@link(MyClass) foo;\``,
    initializer || explicitChild
  );

  let caches = new WeakMap<object, any>();

  return {
    get(this: object) {
      let child = caches.get(this);

      if (!child) {
        if (initializer) {
          child = initializer.call(this);
        }

        if (explicitChild) {
          // How do you narrow this to a constructor?
          child = new explicitChild();
        }

        assert(`Failed to create child instance.`, child);

        associateDestroyableChild(this, child);

        let owner = getOwner(this);

        assert(`Owner was not present on parent. Is instance of ${this.constructor.name}`, owner);

        setOwner(child, owner);

        caches.set(this, child);
        assert(`Failed to create cache for internal resource configuration object`, child);
      }

      return child;
    },
  } as unknown as void /* Thanks TS. */;
}
