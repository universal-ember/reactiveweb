# Minimum Supported

Changes from the other test-app

```
'ember-source': '~3.28.0',
```

Newer versions require ember-source@4.8+
We depend on latest ember-async-data
so that our types can pass.

```
'ember-async-data': '0.7.1',
```

This is needed until ember-source @ 4.5,
when the functions are supported as helpers

```
'ember-functions-as-helper-polyfill': '2.1.2',
```

for compatibility with latest ember-qunit
(internal testing only)

```
'ember-cli': '~4.12.1',
```
