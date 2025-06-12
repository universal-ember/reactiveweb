import { cell, resource, resourceFactory } from 'ember-resources';

interface Options<State, Value> {
  create: () => State;
  update: (state: State) => void;
  read: (state: State) => Value;
}

const counterOptions: Options<ReturnType<typeof cell<number>>, number> = {
  create: () => cell(0),
  update: (x) => void x.current++,
  read: (x) => x.current,
};

const durationOptions: Options<{ start: number; last: number }, number> = {
  create: () => ({ start: Date.now(), last: Date.now() }),
  update: (x) => (x.last = Date.now()),
  read: (x) => x.last - x.start,
};

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

export function Seconds() {
  return Interval(1000, counterOptions);
}

export function Duration() {
  return Interval(1000, durationOptions);
}

resourceFactory(Interval);
resourceFactory(Seconds);
resourceFactory(Duration);
