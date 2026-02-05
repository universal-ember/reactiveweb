/**
 * Reactively wait for a time.
 * uses setTimeout and cleans up if the caller is cleaned up.
 *
 * Usage in a template
 * ```hbs
 * {{#let (WaitUntil 500) as |delayFinished|}}
 *    {{#if delayFinished}}
 *
 *      text displayed after 500ms
 *
 *    {{/if}}
 * {{/let}}
 * ```
 */
export declare const WaitUntil: ((maybeDelayMs?: number | (() => number | undefined) | undefined) => boolean) | (() => boolean);
//# sourceMappingURL=wait-until.d.ts.map