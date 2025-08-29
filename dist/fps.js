import { resource, cell, resourceFactory } from 'ember-resources';

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
const FrameRate = resource(({
  on
}) => {
  let value = cell(0);
  let startTime = new Date().getTime();
  let frame;
  let update = () => {
    // simulate receiving data as fast as possible
    frame = requestAnimationFrame(() => {
      value.current++;
      update();
    });
  };
  on.cleanup(() => cancelAnimationFrame(frame));

  // Start the infinite requestAnimationFrame chain
  update();
  return () => {
    let elapsed = (new Date().getTime() - startTime) * 0.001;
    let fps = value.current * Math.pow(elapsed, -1);
    let rounded = Math.round(fps * 100) * 0.01;
    // account for https://stackoverflow.com/a/588014/356849
    let formatted = `${rounded}`.substring(0, 5);
    return formatted;
  };
});

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
const UpdateFrequency = resourceFactory((ofWhat, updateInterval = 500) => {
  updateInterval ||= 500;
  let multiplier = 1000 / updateInterval;
  let framesSinceUpdate = 0;
  return resource(({
    on
  }) => {
    let value = cell(0);
    let interval = setInterval(() => {
      value.current = framesSinceUpdate * multiplier;
      framesSinceUpdate = 0;
    }, updateInterval);
    on.cleanup(() => clearInterval(interval));
    return () => {
      ofWhat();
      framesSinceUpdate++;
      return value.current;
    };
  });
});

export { FrameRate, UpdateFrequency };
//# sourceMappingURL=fps.js.map
