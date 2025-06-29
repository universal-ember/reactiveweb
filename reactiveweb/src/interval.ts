import { cell, resource, resourceFactory } from 'ember-resources';

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
export function Interval<State, Value>(ms = 1000, options: Options<State, Value>) {
  return resource(({ on }) => {
    const value = options.create();
    const interval = setInterval(() => {
      options.update(value);
    }, ms);

    on.cleanup(() => {
      clearInterval(interval);
    });

    return () => options.read(value);
  });
}

const secondsOptions: Options<{ start: number; last: ReturnType<typeof cell<number>> }, number> = {
  create: () => ({ start: Date.now(), last: cell(Date.now()) }),
  update: (x) => void (x.last.current = Date.now()),
  read: (x) => Math.round((x.last.current - x.start) / 1000),
};

/**
 * Returns a live-updating count of seconds passed since initial rendered.
 * Always returns an integer.
 * Updates every 1 second.
 */
export function Seconds() {
  return Interval(1000, secondsOptions);
}

const durationOptions: Options<{ start: number; last: ReturnType<typeof cell<number>> }, number> = {
  create: () => ({ start: Date.now(), last: cell(Date.now()) }),
  update: (x) => void (x.last.current = Date.now()),
  read: (x) => x.last.current - x.start,
};

/**
 * Returns a live-updating duration since initial render.
 * Measured in milliseconds.
 *
 * By default updates every 1 second.
 *
 * Useful combined with
 * [Temporal.Duration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/Duration)
 */
export function Duration(ms = 1000) {
  return Interval(ms, durationOptions);
}

resourceFactory(Interval);
resourceFactory(Seconds);
resourceFactory(Duration);
