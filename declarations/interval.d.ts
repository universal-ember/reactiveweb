export interface Options<State, Value> {
    create: () => State;
    update: (state: State) => void;
    read: (state: State) => Value;
}
/**
 * Utility for live-updating data based on some interval.
 * Can be used for keeping track of durations, time-elapsed, etc.
 *
 * Defaults to updating every 1 second.
 * Options requires specifying how to create, update, and read the state.
 */
export declare function Interval<State, Value>(ms: number | undefined, options: Options<State, Value>): Value;
/**
 * Returns a live-updating count of seconds passed since initial rendered.
 * Always returns an integer.
 * Updates every 1 second.
 */
export declare function Seconds(): number;
/**
 * Returns a live-updating duration since initial render.
 * Measured in milliseconds.
 *
 * By default updates every 1 second.
 *
 * Useful combined with
 * [Temporal.Duration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration)
 */
export declare function Duration(ms?: number): number;
//# sourceMappingURL=interval.d.ts.map