export interface Stage1DecoratorDescriptor {
    initializer: () => unknown;
}
export type Stage1Decorator = (prototype: object, key: string | symbol, descriptor?: Stage1DecoratorDescriptor) => any;
export interface Class<Instance> {
    new (...args: unknown[]): Instance;
}
export type EmptyObject = {};
export type GetOrElse<Obj, K, Fallback> = K extends keyof Obj ? Obj[K] : Fallback;
export type ArgsFor<S> = S extends {
    Named?: object;
    Positional?: unknown[];
} ? {
    Named: GetOrElse<S, 'Named', EmptyObject>;
    Positional: GetOrElse<S, 'Positional', []>;
} : S extends {
    named?: object;
    positional?: unknown[];
} ? {
    Named: GetOrElse<S, 'named', EmptyObject>;
    Positional: GetOrElse<S, 'positional', []>;
} : {
    Named: EmptyObject;
    Positional: [];
};
export type ElementFor<S> = 'Element' extends keyof S ? S['Element'] extends Element ? S['Element'] : Element : Element;
/**
 * Converts a variety of types to the expanded arguments type
 * that aligns with the 'Args' portion of the 'Signature' types
 * from ember's helpers, modifiers, components, etc
 */
export type ExpandArgs<T> = T extends any[] ? ArgsFor<{
    Positional: T;
}> : T extends any ? ArgsFor<T> : never;
export type Positional<T> = ExpandArgs<T>['Positional'];
export type Named<T> = ExpandArgs<T>['Named'];
//# sourceMappingURL=types.d.ts.map