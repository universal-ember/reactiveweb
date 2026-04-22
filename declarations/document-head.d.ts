/**
 * Adds a `<script>` element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the script with the same URL.
 *
 * @example
 * ```js
 * import { addScript } from 'reactiveweb/document-head';
 *
 * <template>
 *  {{addScript "https://my.cdn.com/asset/v1.2.3/file/path.js"}}
 * </template>
 * ```
 */
export declare function addScript(url: string | (() => string), attributes?: HTMLScriptElement & {}): void;
/**
 * Adds a `<link>` element to the document head.
 * Removed when the rendering context is torn down.
 *
 * No-ops if something else already added the link with the same URL.
 *
 * @example
 * ```js
 * import { addLink } from 'reactiveweb/document-head';
 *
 * <template>
 *  {{addLink "https://my.cdn.com/asset/v1.2.3/file/path.css"}}
 * </template>
 * ```
 */
export declare function addLink(url: string | (() => string), attributes?: HTMLLinkElement & {}): void;
//# sourceMappingURL=document-head.d.ts.map