import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

const compatOwner = {
  linkOwner(toHaveOwner, alreadyHasOwner) {
    const owner = compatOwner.getOwner(alreadyHasOwner);
    if (owner) {
      compatOwner.setOwner(toHaveOwner, owner);
    }
  }
};
if (macroCondition(dependencySatisfies('ember-source', '>=4.12.0'))) {
  // In no version of ember where `@ember/owner` tried to be imported did it exist
  // if (macroCondition(false)) {
  // Using 'any' here because importSync can't lookup types correctly

  compatOwner.getOwner = importSync('@ember/owner').getOwner;
  compatOwner.setOwner = importSync('@ember/owner').setOwner;
} else {
  // Using 'any' here because importSync can't lookup types correctly
  compatOwner.getOwner = importSync('@ember/application').getOwner;
  compatOwner.setOwner = importSync('@ember/application').setOwner;
}

export { compatOwner };
//# sourceMappingURL=ember-compat.js.map
