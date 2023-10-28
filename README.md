# reactiveweb

A collection of utilities for helping applications be more reactive.

This library intends to provide convinence utilities for allow derived data patterns and easy reactivity to be added to applications.

## Compatibility

- Ember.js v4.8 or above
- Embroider or ember-auto-import v2

## Installation

```
pnpm add reactiveweb
```

## Usage

### `ReactiveImage`


Usage in a component
```gjs
import { ReactiveImage } from 'reactiveweb/image';

<template>
  {{#let (ReactiveImage 'https://path.to.image') as |state|}}
     {{#if imgState.isResolved}}
       <img src={{imgState.value}}>
     {{/if}}
  {{/let}}
</template>
```

Usage in a class
```js
import { use } from 'ember-resources';
import { ReactiveImage } from 'reactiveweb/image';

class Demo {
  @use imageState = ReactiveImage('https://path.to.image');
}
```

Reactive usage in a class
```js
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-resources';
import { ReactiveImage } from 'reactiveweb/image';

class Demo {
  @tracked url = '...';
  @use imageState = ReactiveImage(() => this.url);
}
```

### `WaitUntil`

Usage in a component
```gjs
import { WaitUntil } from 'reactiveweb/wait-until';

<template>
  {{#let (WaitUntil 500) as |delayFinished|}}
    {{#if delayFinished}}
 
      text displayed after 500ms
 
    {{/if}}
  {{/let}}
</template>
```

Usage in a class
```js
import { use } from 'ember-resources';
import { WaitUntil } from 'reactiveweb/wait-until';

class Demo {
  @use delayFinished = WaitUntil(500);

  get isFinished() {
    return this.delayFinished; // true after 500ms
  }
}
```

Reactive usage in a class
```js
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-resources';
import { ReactiveImage } from 'reactiveweb/image';

class Demo {
  @tracked delay = 500;
  @use delayFinished = WaitUntil(() => this.delay);

  get isFinished() {
    return this.delayFinished; // true after this.delay ms
  }
}
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
