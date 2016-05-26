# validy

Nested objects validation with support of async validators

[![NPM version](https://img.shields.io/npm/v/validy.svg)](https://npmjs.org/package/validy)
[![Build status](https://img.shields.io/travis/Jokero/validy.svg)](https://travis-ci.org/Jokero/validy)

**Note:** This module works in browsers and Node.js >= 4.0.

## Installation

```sh
npm install validy
```

### Node.js
```js
const validy = require('validy');
```

### Browser
```
<script src="node_modules/validy/dist/validy.js">
```
or minified version
```
<script src="node_modules/validy/dist/validy.min.js">
```

You can use the module with AMD/CommonJS or just use `window.validy`.

## Usage

### validy(object, schema, [options])

**Parameters**

* `object` (Object) - Object to validate
* `schema` (Object) - Schema which defines how to validate object
* `[options]` (Object) - Validation options
    - `[format]` (String) - Format of object with validation errors
    - `[timeout=10000]` (Number) - Validation time limit after which an timeout error will be thrown
    - `[maxPropertyErrorsCount]` (Number) - Factory for error creation if object not found

**Return value**

(Promise) - Result of validation

## Build

```sh
npm install
npm run build
```

## Tests

```sh
npm install
npm test
```

## License

[MIT](LICENSE)