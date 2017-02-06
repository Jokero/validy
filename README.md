# validy

Declarative validation with async validators support

[![NPM version](https://img.shields.io/npm/v/validy.svg)](https://npmjs.org/package/validy)
[![Build status](https://img.shields.io/travis/Jokero/validy.svg)](https://travis-ci.org/Jokero/validy)

**Note:** This module works in browsers and Node.js >= 6.0.

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

## Overview

`validy` allows you to validate flat and nested objects using collection of default validators. 

You can add your own validators. 

Validators can be asynchronous, you can do DB calls for example and so on.

To validate object you should define schema. It's simple object with your constraints:

```js
const objectToValidate = {
    name: 'Fyodor Dostoyevsky'
};

const schema = {
    name: {
        $validate: {
            required: true
        }
    }
};

validy(objectToValidate, schema)
    .then(errors => {
        if (errors) {
            // you have validation errors
        } else {
            // no errors
        }
    });
```

## Usage

### validy(object, schema, [options])

#### Parameters

* `object` (Object) - Object to validate
* `schema` (Object) - Schema which defines how to validate object
* `[options]` (Object) - Validation options
    - `[format=flat]` (string) - Format of object with validation errors (`flat`, `nested`)
    - `[reject=false]` (boolean) - Should return fulfilled promise with errors (`by default`) or rejected with `ValidationError`?

#### Return value

(Promise) - Result of validation. Promise is returned even for synchronous validation

### Validators

#### Built-in validators

By default `validy` uses collection of simple and useful validators ([common-validators](https://github.com/tamtakoe/common-validators) module).

**NOTE**:
The basic principle of built-in validators is that many of them (except `required`, `notEmpty` and type validators like `object`, `array`) consider empty values as **valid values**.
Empty values:
- `undefined`
- `null`
- `NaN`
- `''`
- `'   '` // whitespace only string
- `[]`
- `{}`

Examples of validators:

- **required (presence)** - validates that the value isn't `undefined`, `null`, `NaN`, empty or whitespace only string, empty array or object
- **notEmpty** - like `required` but `undefined` is valid value. It is useful for PATCH requests
- **object / array / string / number / integer / ...** - value is plain object, array, ...
- **max** - value is less than maximum
- **min** - value is greater than minimum
- **range** - value is in range
- **maxLength** - value length is greater than maximum
- **minLength** - value length is greater than minimum
- **pattern** - value matches the pattern
- **inclusion** - value is contained in white list
- **exclusion** - value is not contained in black list
- **email** - value is email address
- **url** - value is URL
- and many others (see [common-validators#validators](https://github.com/tamtakoe/common-validators#validators))

#### Custom validator

You can add your own validator:

```js
validy.validators.add('lowercased', function(value) {
    if (typeof value === 'string') {
        if (value.toLowerCase() !== value) {
            return 'must be lowercased';
        }
    }
});

// or

validy.validators.add({
    lowercased: function(value) {
        if (typeof value === 'string') {
            if (value.toLowerCase() !== value) {
                return 'must be lowercased';
            }
        }
    },
    
    anotherValidator: function() { /**/ }
});
```

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