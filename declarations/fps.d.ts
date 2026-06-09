/**
 * Utility that uses requestAnimationFrame to report
 * how many frames per second the current monitor is
 * rendering at.
 *
 * The result is rounded to two decimal places.
 *
 * ```js
 * import { FrameRate } from 'reactiveweb/fps';
 *
 * <template>
 *   {{FrameRate}}
 * </template>
 * ```
 */
export declare const FrameRate: string;
/**
 * Utility that will report the frequency of updates to tracked data.
 *
 * ```js
 * import { UpdateFrequency } from 'reactiveweb/fps';
 *
 * export default class Demo extends Component {
 *   @tracked someProp;
 *
 *   @use updateFrequency = UpdateFrequency(() => this.someProp);
 *
 *   <template>
 *     {{this.updateFrequency}}
 *   </template>
 * }
 * ```
 *
 * NOTE: the function passed to UpdateFrequency may not set tracked data.
 */
export declare const UpdateFrequency: ((ofWhat: () => unknown, updateInterval?: any) => number) | (() => number);
//# sourceMappingURL=fps.d.ts.map