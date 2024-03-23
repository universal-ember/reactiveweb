/// <reference types="ember-source/types/stable/@ember/modifier/index" />
import { invokeHelper } from '@ember/helper';
interface ArgsWrapper {
    positional?: readonly unknown[];
    named?: Record<string, any>;
}
import type { FunctionBasedModifierDefinition } from './index.ts';
import type { ElementFor } from '#types';
interface State<S> {
    instance: FunctionBasedModifierDefinition<S>;
    helper: ReturnType<typeof invokeHelper> | null;
}
interface CreatedState<S> extends State<S> {
    element: null;
}
interface InstalledState<S> extends State<S> {
    element: ElementFor<S>;
}
export default class FunctionBasedModifierManager<S> {
    capabilities: import("@ember/modifier").ModifierCapabilities;
    createModifier(instance: FunctionBasedModifierDefinition<S>): CreatedState<S>;
    installModifier(createdState: CreatedState<S>, element: ElementFor<S>, args: ArgsWrapper): void;
    updateModifier(state: InstalledState<S>, args: ArgsWrapper): void;
    destroyModifier(state: InstalledState<S>): void;
}
export {};
//# sourceMappingURL=manager.d.ts.map