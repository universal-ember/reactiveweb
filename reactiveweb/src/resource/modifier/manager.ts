 
import { getValue } from '@glimmer/tracking/primitives/cache';
import { destroy } from '@ember/destroyable';
import { invokeHelper } from '@ember/helper';
import { capabilities } from '@ember/modifier';

interface ArgsWrapper {
  positional?: readonly unknown[];
  named?: Record<string, any>;
}

import { compatOwner } from '../../-private/ember-compat.ts';

import type { FunctionBasedModifierDefinition } from './index.ts';
import type Owner from '@ember/owner';
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

// Wraps the unsafe (b/c it mutates, rather than creating new state) code that
// TS does not yet understand.
function installElement<S>(state: CreatedState<S>, element: ElementFor<S>): InstalledState<S> {
  // SAFETY: this cast represents how we are actually handling the state machine
  // transition: from this point forward in the lifecycle of the modifier, it
  // always behaves as `InstalledState<S>`. It is safe because, and *only*
  // because, we immediately initialize `element`. (We cannot create a new state
  // from the old one because the modifier manager API expects mutation of a
  // single state bucket rather than updating it at hook calls.)
  const installedState = state as State<S> as InstalledState<S>;

  installedState.element = element;

  return installedState;
}

function arrangeArgs(element: Element, args: any) {
  const { positional, named } = args;

  const flattenedArgs = [element, ...positional];

  if (Object.keys(named).length > 0) {
    flattenedArgs.push(named);
  }

  return flattenedArgs;
}

export default class FunctionBasedModifierManager<S> {
  capabilities = capabilities('3.22');

  constructor(owner: Owner) {
    compatOwner.setOwner(this, owner);
  }

  createModifier(instance: FunctionBasedModifierDefinition<S>): CreatedState<S> {
    return { element: null, instance, helper: null };
  }

  installModifier(createdState: CreatedState<S>, element: ElementFor<S>, args: ArgsWrapper): void {
    const state = installElement(createdState, element);

    compatOwner.linkOwner(state, this);

    this.updateModifier(state, args);
  }

  updateModifier(state: InstalledState<S>, args: ArgsWrapper): void {
    if (state.helper) {
      destroy(state.helper);
    }

    state.helper = invokeHelper(this, state.instance, () => {
      const foo = arrangeArgs(state.element, args);

      return { positional: foo };
    });

    getValue(state.helper);
  }

  destroyModifier(state: InstalledState<S>): void {
    if (state.helper) {
      destroy(state.helper);
    }
  }
}
