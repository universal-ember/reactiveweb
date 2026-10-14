import type Owner from '@ember/owner';
interface CompatOwner {
    getOwner: (context: unknown) => Owner | undefined;
    setOwner: (context: unknown, owner: Owner) => void;
    linkOwner: (toHaveOwner: unknown, alreadyHasOwner: unknown) => void;
}
export declare const compatOwner: CompatOwner;
export {};
//# sourceMappingURL=ember-compat.d.ts.map