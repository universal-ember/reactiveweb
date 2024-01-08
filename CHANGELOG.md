# Changelog
## Release (2024-01-08)

reactiveweb 0.2.0 (minor)

#### :rocket: Enhancement
* `reactiveweb`, `test-app`
  * [#34](https://github.com/universal-ember/reactiveweb/pull/34) Add sync ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#31](https://github.com/universal-ember/reactiveweb/pull/31) Add the helper from ember-resources ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `reactiveweb`
  * [#35](https://github.com/universal-ember/reactiveweb/pull/35) Widen the ember-source peerDep to >= 3.28 ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :bug: Bug Fix
* `reactiveweb`
  * [#33](https://github.com/universal-ember/reactiveweb/pull/33) Remove note from ember-resources in the helper jsdoc ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#30](https://github.com/universal-ember/reactiveweb/pull/30) Fix typo in ember-concurrency docs ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
* `reactiveweb`, `test-app`
  * [#32](https://github.com/universal-ember/reactiveweb/pull/32) Fix issue with initial values in `keepLatest` and clarify behavior ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### :house: Internal
* `test-app`
  * [#29](https://github.com/universal-ember/reactiveweb/pull/29) Setup glint in test app ([@NullVoxPopuli](https://github.com/NullVoxPopuli))
  * [#26](https://github.com/universal-ember/reactiveweb/pull/26) Setup release-plan ([@NullVoxPopuli](https://github.com/NullVoxPopuli))

#### Committers: 1
- [@NullVoxPopuli](https://github.com/NullVoxPopuli)

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
