/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Stage1DecoratorDescriptor {
  initializer: () => unknown;
}

export type Stage1Decorator = (
  prototype: object,
  key: string | symbol,
  descriptor?: Stage1DecoratorDescriptor,
) => any;


export interface Class<Instance> {
  new (...args: unknown[]): Instance;
}
