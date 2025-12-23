import { dependencySatisfies, importSync, macroCondition } from '@embroider/macros';

import type Owner from '@ember/owner';

interface CompatOwner {
  getOwner: (context: unknown) => Owner | undefined;
  setOwner: (context: unknown, owner: Owner) => void;
  linkOwner: (toHaveOwner: unknown, alreadyHasOwner: unknown) => void;
}

export const compatOwner = {
  linkOwner(toHaveOwner, alreadyHasOwner) {
    const owner = compatOwner.getOwner(alreadyHasOwner);

    if (owner) {
      compatOwner.setOwner(toHaveOwner, owner);
    }
  },
} as CompatOwner;

if (macroCondition(dependencySatisfies('ember-source', '>=4.12.0'))) {
  // In no version of ember where `@ember/owner` tried to be imported did it exist
  // if (macroCondition(false)) {
  // Using 'any' here because importSync can't lookup types correctly

  compatOwner.getOwner = (importSync('@ember/owner') as any).getOwner;
  compatOwner.setOwner = (importSync('@ember/owner') as any).setOwner;
} else {
  // Using 'any' here because importSync can't lookup types correctly
  compatOwner.getOwner = (importSync('@ember/application') as any).getOwner;
  compatOwner.setOwner = (importSync('@ember/application') as any).setOwner;
}
