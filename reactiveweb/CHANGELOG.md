# reactiveweb

## 0.1.1

### Patch Changes

- 72d6797: Add support for ember-source 3.28 and 5.4

## 0.1.0

### Minor Changes

- d3f5ea4: Copy utilities from ember-resources -- no other changes to the utilities.
  The ember-resources utilities/examples will be be deprecated and removed in a major release.
  However, the migration path is a find and replace:

  Find:

  ```
  'ember-resources/util/
  ```

  Replace:

  ```
  'reactiveweb/
  ```

  Of note:

  - `trackedTask` no longer will support ember-concurrency@v2, so if you need ember-concurrency@v2, it'll be safer to stick with the `trackedTask` from ember-resources@v6.
  - `helper` has been removed, as it's had basically no usage, and wasn't all that useful anyway -- if folks still need the behavior, they can use `invokeHelper` directly.

### Patch Changes

- 881b791: Rename to reactiveweb

## 0.0.3

### Patch Changes

- ee946b1: Fix types
