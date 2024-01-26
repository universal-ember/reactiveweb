import { cell, resource } from 'ember-resources';

/**
 * A utility that creates a resource allowing us to throttle execution of a function.
 * Especially useful for rate limiting execution of handlers on events like resize and scroll.
 *
 * @param delay A zero-or-greater delay in milliseconds. For event callbacks, values around 100 or 250 (or even higher) are most useful.
 * @param callback A function to be executed after delay milliseconds.
 */
export function throttle<Value = unknown>(delay: number, callback: () => Value) {
  const state = cell<Value | undefined>();
  let last: unknown;

  return resource(({ on }) => {
    let timer: number;

    on.cleanup(() => clearTimeout(timer));

    timer = setTimeout(() => (state.current = callback()), delay);
    last = last ?? callback();

    return (state.current ?? last) as Value;
  });
}
