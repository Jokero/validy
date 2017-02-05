(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.validy = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

exports.flat = require('./formatters/flat');
exports.nested = require('./formatters/nested');
},{"./formatters/flat":2,"./formatters/nested":3}],2:[function(require,module,exports){
'use strict';

/**
 * @param {Object} object
 * @param {string} [path='']
 * @param {Object} [flatObject={}]
 * 
 * @returns {Object}
 */

function flatten(object) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var flatObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    Object.keys(object).forEach(function (propertyName) {
        var propertyValue = object[propertyName];

        if (propertyValue instanceof Object && !(propertyValue instanceof Array)) {
            flatten(propertyValue, path + propertyName + '.', flatObject);
        } else {
            flatObject[path + propertyName] = propertyValue;
        }
    });

    return flatObject;
}

/**
 * @param {Object} object
 * 
 * @returns {Object}
 */
module.exports = function (object) {
    return flatten(object);
};
},{}],3:[function(require,module,exports){
'use strict';

/**
 * Errors object has nested structure by default, so we just return object without any changes
 *
 * @param {Object} errors
 *
 * @returns {Object}
 */

module.exports = function (errors) {
  return errors;
};
},{}],4:[function(require,module,exports){
'use strict';

var validateObject = require('./validateObject');
var ValidationError = require('./validationError');
var formatters = require('./formatters');

var DEFAULT_OPTIONS = {
    format: 'flat',
    reject: false
};

/**
 * @param {Object}  object
 * @param {Object}  schema
 * @param {Object}  [options={}]
 * @param {string}    [options.format=flat]
 * @param {boolean}   [options.reject=false]
 *
 * @returns {Promise}
 */
module.exports = function (object, schema) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    return new Promise(function (resolve, reject) {
        var formatter = formatters[options.format];
        if (!formatter) {
            return reject(new Error('Unknown format ' + options.format));
        }

        validateObject(object, schema, object, []).then(function (validationErrors) {
            if (!validationErrors) {
                return resolve();
            }

            var formattedErrors = formatter(validationErrors);

            if (options.reject) {
                reject(new ValidationError(formattedErrors));
            } else {
                resolve(formattedErrors);
            }
        }).catch(reject);
    });
};
},{"./formatters":1,"./validateObject":5,"./validationError":8}],5:[function(require,module,exports){
'use strict';

var validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function (object, schema, fullObject, path) {
    var validationPromises = [];
    var validationErrors = {};

    Object.keys(schema).forEach(function (propertyName) {
        if (propertyName.startsWith('$')) {
            return;
        }

        var propertyValue = object[propertyName];
        var propertyPath = path.concat(propertyName);

        var propertySchema = schema[propertyName];
        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, object, fullObject, propertyPath);
        }

        if (propertySchema instanceof Object) {
            var validationPromise = validateProperty(propertyValue, propertySchema, object, fullObject, propertyPath);

            validationPromise.then(function (validationError) {
                if (validationError) {
                    validationErrors[propertyName] = validationError;
                }
            });

            validationPromises.push(validationPromise);
        }
    });

    return Promise.all(validationPromises).then(function () {
        if (Object.keys(validationErrors).length) {
            return validationErrors;
        }
    });
};
},{"./validateProperty":6}],6:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 *
 */
module.exports = function (value, schema, object, fullObject, path) {
    var validatorsOptions = schema.$validate;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, object, fullObject, path);
    }

    var promise = validatorsOptions instanceof Object ? validateValue(value, validatorsOptions, object, fullObject, path) : Promise.resolve();

    return promise.then(function (validationErrors) {
        if (validationErrors) {
            return validationErrors;
        }

        var validateObject = require('./validateObject');

        if (schema.$items || schema[0]) {
            var _ret = function () {
                if (!(value instanceof Array)) {
                    return {
                        v: Promise.resolve([{
                            error: 'array',
                            message: 'must be an array'
                        }])
                    };
                }

                var propertiesSchema = {};
                var itemSchema = schema.$items || schema[0];

                value.forEach(function (item, index) {
                    return propertiesSchema[index] = itemSchema;
                });

                return {
                    v: validateObject(value, propertiesSchema, fullObject, path)
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }

        if (Object.keys(schema).some(function (propertyName) {
            return !propertyName.startsWith('$');
        })) {
            if (!(value instanceof Object)) {
                return Promise.resolve([{
                    error: 'object',
                    message: 'must be an object'
                }]);
            }

            return validateObject(value, schema, fullObject, path);
        }
    });
};
},{"./validateObject":5,"./validateValue":7}],7:[function(require,module,exports){
'use strict';

var validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function (value, validatorsOptions, object, fullObject, path) {
    var validatorsResultsPromises = [];
    var validationErrors = [];

    Object.keys(validatorsOptions).forEach(function (validatorName) {
        var validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        var validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, fullObject, path);
        }

        if (validatorOptions === false || validatorOptions === null || validatorOptions === undefined) {
            return;
        }

        var validatorResult = validator(value, validatorOptions, object, fullObject, path);

        var validatorResultPromise = Promise.resolve(validatorResult);
        validatorResultPromise.then(function (validationError) {
            if (validationError) {
                validationErrors.push(validationError);
            }
        });

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(function () {
        if (validationErrors.length) {
            return validationErrors;
        }
    });
};
},{"./validators":9}],8:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
        var instance = Reflect.construct(cls, Array.from(arguments));
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
        return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
        constructor: {
            value: cls,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
        ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
}

var ValidationError = function (_extendableBuiltin2) {
    _inherits(ValidationError, _extendableBuiltin2);

    function ValidationError(errors) {
        _classCallCheck(this, ValidationError);

        var _this = _possibleConstructorReturn(this, (ValidationError.__proto__ || Object.getPrototypeOf(ValidationError)).call(this));

        if (Error.captureStackTrace) {
            Error.captureStackTrace(_this, _this.constructor);
        }

        _this.name = _this.constructor.name;
        _this.errors = errors;
        return _this;
    }

    return ValidationError;
}(_extendableBuiltin(Error));

module.exports = ValidationError;
},{}],9:[function(require,module,exports){
'use strict';

var validators = require('common-validators');

validators.confirmOriginal = validators.confirm;
validators.add({
    confirm: function confirm(value, options, object, fullObject, path) {
        var confirmOptions = {
            key: path[path.length - 1],
            comparedKey: options instanceof Object ? options.key : options
        };

        return this.confirmOriginal(object, confirmOptions);
    }
});

module.exports = validators;
},{"common-validators":12}],10:[function(require,module,exports){
'use strict';

var validate = require('./validate');

validate.validators = require('./validators');
validate.formatters = require('./formatters');
validate.ValidationError = require('./validationError');

module.exports = validate;
},{"./formatters":1,"./validate":4,"./validationError":8,"./validators":9}],11:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var toDateTime = require('normalize-date');

/* Validators */
var validators = {
    custom: function custom(value, arg, options) {
        if (typeof arg === 'function') {
            return arg(value, options);
        }
    },

    //Isn't empty
    required: function required(value) {
        if (!exists(value)) {
            return "Is required";
        }
    },
    presence: 'required',

    notEmpty: function notEmpty(value) {
        if (isEmpty(value)) {
            return "Can't be blank";
        }
    },

    //Equality
    equal: function equal(value, arg, options) {
        if (exists(value) && !deepEqual(value, arg, options.strict)) {
            return 'Must be equal %{arg}';
        }
    },

    confirm: function confirm(value, options) {
        if (exists(value) && !deepEqual(toObject(value)[options.key], toObject(value)[options.comparedKey], options.strict)) {
            return '%{key} must be equal %{comparedKey}';
        }
    },

    //Types
    object: function object(value) {
        if (!isPlainObject(value)) {
            return 'Must be an object';
        }
    },

    array: function array(value) {
        if (!isArray(value)) {
            return 'Must be an array';
        }
    },

    string: function string(value) {
        if (!isString(value)) {
            return 'Must be a string';
        }
    },

    number: function number(value) {
        if (!isNumber(value)) {
            return 'Must be a number';
        }
    },

    integer: function integer(value) {
        if (!isInteger(value)) {
            return 'Must be an integer';
        }
    },

    date: function date(value) {
        if (!isDateTime(value)) {
            return 'Must be a valid date';
        }
    },

    boolean: function boolean(value) {
        if (!isBoolean(value)) {
            return 'Must be a boolean';
        }
    },

    function: function _function(value) {
        if (!isFunction(value)) {
            return 'Must be a function';
        }
    },

    null: function _null(value) {
        if (value !== null) {
            return 'Must be a null';
        }
    },

    //Number
    max: function max(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toNumber(value) < arg : toNumber(value) <= arg)) {
            return options.exclusive ? 'Must be less %{arg}' : 'Must be less or equal %{arg}';
        }
    },

    min: function min(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toNumber(value) > arg : toNumber(value) >= arg)) {
            return options.exclusive ? 'Must be more %{arg}' : 'Must be more or equal %{arg}';
        }
    },

    range: function range(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toNumber(value) > options.from : toNumber(value) >= options.from)) {
                return {
                    error: 'range.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toNumber(value) < options.to : toNumber(value) <= options.to)) {
                return {
                    error: 'range.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    odd: function odd(value) {
        if (exists(value) && toNumber(value) % 2 !== 1) {
            return 'Must be odd';
        }
    },

    even: function even(value) {
        if (exists(value) && toNumber(value) % 2 !== 0) {
            return 'Must be even';
        }
    },

    divisible: function divisible(value, arg) {
        if (exists(value) && toNumber(value) % arg !== 0) {
            return 'Must be divisible by %{arg}';
        }
    },

    maxLength: function maxLength(value, arg) {
        if (exists(value) && toArray(value).length > arg) {
            return 'Length must be less or equal %{arg}';
        }
    },

    minLength: function minLength(value, arg) {
        if (exists(value) && toArray(value).length < arg) {
            return 'Length must be more or equal %{arg}';
        }
    },

    equalLength: function equalLength(value, arg) {
        if (exists(value) && toArray(value).length !== arg) {
            return 'Length must be equal %{arg}';
        }
    },

    rangeLength: function rangeLength(value, options) {
        if (exists(value)) {
            if (toArray(value).length > options.to) {
                return {
                    error: 'rangeLength.many',
                    message: options.manyMessage || 'Length must be from %{from} to %{to}'
                };
            } else if (toArray(value).length < options.from) {
                return {
                    error: 'rangeLength.less',
                    message: options.lessMessage || 'Length must be from %{from} to %{to}'
                };
            }
        }
    },

    //Size
    maxSize: function maxSize(value, arg) {
        var valueSize = byteLength(value);

        if (exists(value) && valueSize > arg) {
            return {
                message: 'Size must be less %{arg}',
                size: valueSize
            };
        }
    },

    minSize: function minSize(value, arg) {
        var valueSize = byteLength(value);

        if (exists(value) && valueSize < arg) {
            return {
                message: 'Size must be more %{arg}',
                size: valueSize
            };
        }
    },

    equalSize: function equalSize(value, arg) {
        var valueSize = byteLength(value);

        if (exists(value) && valueSize !== arg) {
            return {
                message: 'Length must be equal %{arg}',
                size: valueSize
            };
        }
    },

    rangeSize: function rangeSize(value, options) {
        var valueSize = byteLength(value);

        if (exists(value)) {
            if (valueSize < options.from) {
                return {
                    error: 'rangeSize.less',
                    message: options.lessMessage || 'Size must be from %{from} to %{to}',
                    size: valueSize
                };
            } else if (valueSize > options.to) {
                return {
                    error: 'rangeSize.many',
                    message: options.manyMessage || 'Size must be from %{from} to %{to}',
                    size: valueSize
                };
            }
        }
    },

    //RegExp
    pattern: function pattern(value, arg) {
        if (exists(value) && !new RegExp(arg).test(toString(value))) {
            return 'Does not match the pattern %{arg}';
        }
    },

    //White and black list
    inclusion: function inclusion(value, arg) {
        if (exists(value) && !contains(arg, value)) {
            return '%{value} is not allowed';
        }
    },

    exclusion: function exclusion(value, arg) {
        if (exists(value) && contains(arg, value, true)) {
            return '%{value} is restricted';
        }
    },

    //Date and time
    maxDateTime: function maxDateTime(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDateTime(value) < toDateTime(arg) : toDateTime(value) <= toDateTime(arg))) {
            return 'Must be earlier than %{arg}';
        }
    },

    maxDate: function maxDate(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDate(value) < toDate(arg) : toDate(value) <= toDate(arg))) {
            return 'Must be earlier than %{arg}';
        }
    },

    minDateTime: function minDateTime(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDateTime(value) > toDateTime(arg) : toDateTime(value) >= toDateTime(arg))) {
            return 'Must be no earlier than %{arg}';
        }
    },

    minDate: function minDate(value, arg, options) {
        if (exists(value) && !(options.exclusive ? toDate(value) > toDate(arg) : toDate(value) >= toDate(arg))) {
            return 'Must be no earlier than %{arg}';
        }
    },

    equalDateTime: function equalDateTime(value, arg) {
        if (exists(value) && toDateTime(value).valueOf() !== toDateTime(arg).valueOf()) {
            return 'Must be equal %{arg}';
        }
    },

    equalDate: function equalDate(value, arg) {
        if (exists(value) && toDate(value).valueOf() !== toDate(arg).valueOf()) {
            return 'Must be equal %{arg}';
        }
    },

    rangeDateTime: function rangeDateTime(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toDateTime(value) > toDateTime(options.from) : toDateTime(value) >= toDateTime(options.from))) {
                return {
                    error: 'rangeDateTime.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toDateTime(value) < toDateTime(options.to) : toDateTime(value) <= toDateTime(options.to))) {
                return {
                    error: 'rangeDateTime.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    rangeDate: function rangeDate(value, options) {
        if (exists(value)) {
            if (!(options.exclusiveFrom || options.exclusive ? toDate(value) > toDate(options.from) : toDate(value) >= toDate(options.from))) {
                return {
                    error: 'rangeDate.many',
                    message: options.manyMessage || 'Must be from %{from} to %{to}'
                };
            } else if (!(options.exclusiveTo || options.exclusive ? toDate(value) < toDate(options.to) : toDate(value) <= toDate(options.to))) {
                return {
                    error: 'rangeDate.less',
                    message: options.lessMessage || 'Must be from %{from} to %{to}'
                };
            }
        }
    },

    //Web
    email: function email(value) {
        var PATTERN = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;

        if (exists(value) && !PATTERN.exec(toString(value))) {
            return 'Must be a valid email';
        }
    },

    // A URL validator that is used to validate URLs with the ability to
    // restrict schemes and some domains.
    url: function url(value, options) {
        if (exists(value)) {
            var protocols = options.protocols || ['http', 'https'];

            // https://gist.github.com/dperini/729294
            var regex = '^' +
            // schemes
            '(?:(?:' + protocols.join('|') + '):\\/\\/)' +
            // credentials
            '(?:\\S+(?::\\S*)?@)?';

            regex += '(?:';

            var tld = '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))';

            // This ia a special case for the localhost hostname
            if (options.allowLocal) {
                tld += '?';
            } else {
                // private & local addresses
                regex += '(?!10(?:\\.\\d{1,3}){3})' + '(?!127(?:\\.\\d{1,3}){3})' + '(?!169\\.254(?:\\.\\d{1,3}){2})' + '(?!192\\.168(?:\\.\\d{1,3}){2})' + '(?!172' + '\\.(?:1[6-9]|2\\d|3[0-1])' + '(?:\\.\\d{1,3})' + '{2})';
            }

            var hostname = '(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)' + '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*' + tld + ')';

            // reserved addresses
            regex += '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' + '|' + hostname +
            // port number
            '(?::\\d{2,5})?' +
            // path
            '(?:\\/[^\\s]*)?' + '$';

            var PATTERN = new RegExp(regex, 'i');

            if (!PATTERN.exec(toString(value))) {
                return 'is not a valid url';
            }
        }
    },

    ipAddress: function ipAddress(value, options) {
        if (exists(value)) {
            var IPV4_REGEXP = /^\s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))\s*$/;
            var IPV6_REGEXP = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
            var HOSTNAME_REGEXP = /^\s*((?=.{1,255}$)(?=.*[A-Za-z].*)[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|\b-){0,61}[0-9A-Za-z])?)*)\s*$/;

            var regExps = { ipv4: IPV4_REGEXP, ipv6: IPV6_REGEXP, hostname: HOSTNAME_REGEXP };

            var isError = !Object.keys(regExps).some(function (key) {
                if (options[key] || options[key] === undefined) {
                    return regExps[key].test(toString(value));
                }
            });

            var ipv4 = options.ipv4;
            var ipv6 = options.ipv6;
            var hostname = options.hostname;

            if (isError) {
                if (ipv4 && !ipv6 && !hostname) {
                    return {
                        error: 'ip.v4',
                        message: options.ipv4Message || 'Must be a valid IPv4 address'
                    };
                }

                if (ipv6 && !ipv4 && !hostname) {
                    return {
                        error: 'ip.v6',
                        message: options.ipv6Message || 'Must be a valid IPv6 address'
                    };
                }

                if (hostname && !ipv4 && !ipv6) {
                    return {
                        error: 'ip.hostname',
                        message: options.hostnameMessage || 'Must be a valid hostname'
                    };
                }

                if (ipv6 && ipv4 && !hostname) {
                    return {
                        error: 'ip.address',
                        message: options.addressMessage || 'Must be a valid IP address'
                    };
                }

                return 'Must be a valid IP address or hostname';
            }
        }
    },

    //File
    accept: function accept(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files)) {
            var _ret = function () {
                var allowedTypes = (arg || '').split(',').map(function (type) {
                    return type.trim().replace('*', '');
                });

                var isError = files.some(function (file) {
                    return allowedTypes.every(function (type) {
                        if (type[0] === '.') {
                            //extension
                            return '.' + ((file.name || '').split('.').pop() || '').toLowerCase() !== type;
                        } else {
                            //mime type
                            return (file.type || '').indexOf(type) === -1;
                        }
                    });
                });

                if (isError) {
                    return {
                        v: 'File must be a %{arg}'
                    };
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }
    },
    minFileSize: function minFileSize(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !files.every(function (file) {
            return toNumber(file.size) >= arg;
        })) {
            return 'File size must be more or equal %{arg} bytes';
        }
    },
    maxFileSize: function maxFileSize(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !files.every(function (file) {
            return toNumber(file.size) <= arg;
        })) {
            return 'File size must be less or equal %{arg} bytes';
        }
    },
    minFileSizeAll: function minFileSizeAll(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !(files.reduce(function (prev, curr) {
            return toNumber(prev.size || prev) + toNumber(curr.size);
        }) >= arg)) {
            return 'Total files size must be more or equal %{arg} bytes';
        }
    },
    maxFileSizeAll: function maxFileSizeAll(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && !(files.reduce(function (prev, curr) {
            return toNumber(prev.size || prev) + toNumber(curr.size);
        }) <= arg)) {
            return 'Total files size must be less or equal %{arg} bytes';
        }
    },
    minFileNameLength: function minFileNameLength(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && files.some(function (file) {
            return toArray(file.name).length < arg;
        })) {
            return 'File name length must be more or equal %{arg}';
        }
    },
    maxFileNameLength: function maxFileNameLength(files, arg, options) {
        files = toArray(options.files || files);

        if (exists(files) && files.some(function (file) {
            return toArray(file.name).length > arg;
        })) {
            return 'File name length must be less or equal %{arg}';
        }
    },


    //Test
    alwaysValid: function alwaysValid() {},
    alwaysInvalid: function alwaysInvalid() {
        return 'Any value is invalid';
    }
};

/* Utils */
var util = {
    toDateTime: toDateTime,
    toDate: toDate,
    isNumber: isNumber,
    isFunction: isFunction,
    isInteger: isInteger,
    isBoolean: isBoolean,
    isArray: isArray,
    isDateTime: isDateTime,
    isString: isString,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isDefined: isDefined,
    isEmpty: isEmpty,
    exists: exists,
    contains: contains,
    toArray: toArray,
    toNumber: toNumber,
    toString: toString,
    toObject: toObject,
    byteLength: byteLength
};

function toDate(date) {
    return toDateTime(date, { noTime: true });
}

function isNumber(value) {
    return typeof value === 'number' && !isNaN(value);
}

function isFunction(value) {
    return typeof value === 'function';
}

function isInteger(value) {
    return isNumber(value) && value % 1 === 0;
}

function isBoolean(value) {
    return typeof value === 'boolean';
}

function isArray(value) {
    return Array.isArray(value);
}

function isDateTime(value) {
    return !isArray(value) && !isNaN(Date.parse(value));
}

function isString(value) {
    return typeof value === 'string';
}

function isObject(obj) {
    return obj === Object(obj);
}

//This is no full plain-object checking, but it is better for validation when you need to know
//that object is no array or hasn't common type. Generally you prefer to consider instance of custom class as object
function isPlainObject(value) {
    return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object' && value !== null && !isArray(value) && !(value instanceof RegExp) && !(value instanceof Date) && !(value instanceof Error) && !(value instanceof Number) && !(value instanceof String) && !(value instanceof Boolean) && (typeof value.toDateTime !== 'function' || value.propertyIsEnumerable('toDateTime')); //Moment.js date
}

// Returns false if the object is `null` of `undefined`
function isDefined(obj) {
    return obj != null;
}

//Note! undefined is not empty
function isEmpty(value) {
    if (value === null || typeof value === 'number' && isNaN(value)) {
        return true;
    }

    if (isString(value)) {
        return (/^\s*$/.test(value)
        ); //Whitespace only strings are empty
    }

    if (isArray(value)) {
        return value.length === 0;
    }

    if (isPlainObject(value)) {
        //If we find at least one property we consider it non empty
        for (var attr in value) {
            return false;
        }
        return true;
    }

    return value instanceof Date && isNaN(Date.parse(value)); //Invalid date is empty

    //Boolean, Date, RegExp, Error, Number, Function etc. are not empty
}

function exists(value) {
    return value !== undefined && !isEmpty(value);
}

function contains(collection, value, some) {
    some = some ? 'some' : 'every';

    if (!isDefined(collection)) {
        return false;
    }

    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        return toArray(value)[some](function (val) {
            return contains(collection, val);
        });
    }

    return toArray(collection).indexOf(value) !== -1;
}

function deepEqual(actual, expected, strict) {
    if (strict !== false) {
        strict = true;
    }

    if (actual === expected) {
        return true;
    } else if (actual instanceof Date && expected instanceof Date) {
        return actual.getTime() === expected.getTime();
    } else if (!actual || !expected || (typeof actual === 'undefined' ? 'undefined' : _typeof(actual)) != 'object' && (typeof expected === 'undefined' ? 'undefined' : _typeof(expected)) != 'object') {
        return strict ? actual === expected : actual == expected;
    } else {
        return objEqual(actual, expected, strict);
    }
}

function objEqual(a, b, strict) {
    var i, key;

    if (!isDefined(a) || !isDefined(b)) {
        return false;
    }

    if (a.prototype !== b.prototype) return false;

    try {
        var ka = Object.keys(a),
            kb = Object.keys(b);
    } catch (e) {
        //happens when one is a string literal and the other isn't
        return false;
    }

    if (ka.length !== kb.length) return false;

    ka.sort();
    kb.sort();

    //cheap key test
    for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i]) return false;
    }

    //possibly expensive deep test
    for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!deepEqual(a[key], b[key], strict)) return false;
    }

    return (typeof a === 'undefined' ? 'undefined' : _typeof(a)) === (typeof b === 'undefined' ? 'undefined' : _typeof(b));
}

/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f\\ufe20-\\ufe23',
    rsComboSymbolsRange = '\\u20d0-\\u20f0',
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + rsAstralRange + ']',
    rsCombo = '[' + rsComboMarksRange + rsComboSymbolsRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + rsVarRange + ']?',
    rsOptJoin = '(?:' + rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange + rsComboMarksRange + rsComboSymbolsRange + rsVarRange + ']');
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

function toArray(value) {
    if (!value) {
        return [];
    }

    if (isArray(value)) {
        return value;
    }

    if (isString(value)) {
        return reHasUnicode.test(value) ? string.match(reUnicode) || [] : value.split('');
    }

    if (Array.from && (value.length || value instanceof Map || value instanceof Set || value[Symbol && Symbol.iterator])) {
        return Array.from(value);
    }

    return Object.keys(value);
}

function toNumber(value) {
    return Number(value);
}

function toString(value) {
    return value && !isObject(value) ? String(value) : '';
}

function toObject(value) {
    return isObject(value) ? value : {};
}

function byteLength(str) {
    str = str ? typeof str === 'string' ? str : JSON.stringify(str) : '';
    // returns the byte length of an utf8 string
    var s = str.length;
    for (var i = str.length - 1; i >= 0; i--) {
        var code = str.charCodeAt(i);
        if (code > 0x7f && code <= 0x7ff) s++;else if (code > 0x7ff && code <= 0xffff) s += 2;
    }
    return s;
}

/* Export */
module.exports = {
    validators: validators,
    util: util
};
},{"normalize-date":14}],12:[function(require,module,exports){
'use strict';

var validatorsLibrary = require('./common-validators-library');
var validators = require('validators-constructor')();

validators.util = validatorsLibrary.util;

module.exports = validators.add(validatorsLibrary.validators);
},{"./common-validators-library":11,"validators-constructor":13}],13:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var FORMAT_REGEXP = /(%?)%\{([^\}]+)\}/g; // Finds %{key} style patterns in the given string
var MESSAGE_REGEXP = /message/i;
var hiddenPropertySettings = {
    enumerable: false,
    configurable: false,
    writable: true
};
var RESULT_HANDLER = 'resultHandler';
var EXCEPTION_HANDLER = 'exceptionHandler';
var ERROR_FORMAT = 'errorFormat';
var MESSAGE = 'message';
var SIMPLE_ARGS_FORMAT = 'simpleArgsFormat';
var ARG = 'arg';

/**
 * Add extra advantages to validator
 *
 * @param {Object}   validators - validators library
 * @param {String}   name - validator's name
 * @param {Function} validator - user validator
 *
 * @returns {Function} extended validator
 */
function validatorWrapper(validators, name, validator) {
    return function (value, options) {
        var error = void 0,
            args = arguments;
        var alias = this && this.alias;
        var validatorObj = validators[name];
        var validatorAliasObj = alias ? validators[alias] : {};
        var arg = validatorObj[ARG] || validatorAliasObj[ARG] || validators[ARG];
        var isSimpleArgsFormat = validatorObj[SIMPLE_ARGS_FORMAT] || validatorAliasObj[SIMPLE_ARGS_FORMAT] || validators[SIMPLE_ARGS_FORMAT];

        options = Object.assign({}, validatorObj.defaultOptions, validatorAliasObj.defaultOptions, options);

        if (typeof options.parse === 'function') {
            value = options.parse(value);
        }

        if (options.hasOwnProperty(arg) && !isSimpleArgsFormat) {
            args = [value, options[arg]].concat(Array.prototype.slice.call(arguments, 1));
        }

        try {
            var resultHandler = validatorObj[RESULT_HANDLER] || validatorAliasObj[RESULT_HANDLER] || validators[RESULT_HANDLER];

            error = resultHandler(validator.apply(validators, args));
        } catch (err) {
            var exceptionHandler = validatorObj[EXCEPTION_HANDLER] || validatorAliasObj[EXCEPTION_HANDLER] || validators[EXCEPTION_HANDLER];

            if (typeof exceptionHandler === 'function') {
                error = exceptionHandler(err);
            } else {
                throw err;
            }
        }

        function handleError(error) {
            if (error) {
                var _ret = function () {
                    var errorObj = (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' ? error : null; //in case if we rewrite message in options and want to use fields from error object in the placeholders
                    var message = options[MESSAGE] || validatorObj[MESSAGE] || validatorAliasObj[MESSAGE];

                    if (message) {
                        error = message;
                    }

                    var formattedErrorMessage = validators.formatMessage(error, Object.assign({ validator: alias || name, value: value }, errorObj, options));
                    var format = validatorObj[ERROR_FORMAT] || validatorAliasObj[ERROR_FORMAT] || validators[ERROR_FORMAT];

                    if (format) {
                        if (typeof formattedErrorMessage === 'string') {
                            formattedErrorMessage = { message: formattedErrorMessage };
                        }

                        if (format.$options) {
                            format = Object.assign({}, format);

                            Object.keys(options).forEach(function (key) {
                                if (!MESSAGE_REGEXP.test(key) && typeof options[key] !== 'function') {
                                    format[key] = options[key];
                                }
                            });
                        }
                        delete format.$options;

                        if (format.$origin) {
                            format = Object.assign({}, format, formattedErrorMessage);
                        }
                        delete format.$origin;

                        return {
                            v: validators.formatMessage(format, Object.assign({ validator: alias || name, value: value }, options, formattedErrorMessage))
                        };
                    }

                    return {
                        v: formattedErrorMessage
                    };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
            }
        }

        return (typeof error === 'undefined' ? 'undefined' : _typeof(error)) === 'object' && typeof error.then === 'function' ? error.then(handleError) : handleError(error);
    };
}

/**
 * Format string with patterns
 *
 * @param {String} str ("I'm %{age} years old")
 * @param {Object} [values] ({age: 21})
 *
 * @returns {String} formatted string ("I'm 21 years old")
 */
function formatStr(str, values) {
    values = values || {};

    if (typeof str !== 'string') {
        return str;
    }

    return str.replace(FORMAT_REGEXP, function (m0, m1, m2) {
        return m1 === '%' ? "%{" + m2 + "}" : values[m2];
    });
}

/**
 * Check that value is plain object
 *
 * @param {Any} value
 *
 * @returns {Boolean}
 */
function isPlainObject(value) {
    return {}.toString.call(value) === '[object Object]' && (typeof value.toDate !== 'function' || value.propertyIsEnumerable('toDate')); //For moment.js dates
}

/**
 * Validators constructor
 *
 * @param {Object}          [params]
 * @param {Object}            [errorFormat] - format of validators result
 * @param {Function}          [formatStr] - for format message strings with patterns
 * @param {Function}          [resultHandler] - handle result of validation
 * @param {Function|String}   [exceptionHandler] - handle JS exceptions
 * @param {String}            [simpleArgsFormat] - don't map arg to options.arg or vice versa
 * @param {String}            [arg] - name of compared value
 * @param {Object}            [util] - reserved for validator's libraries helpers
 *
 * @constructor
 */
function Validators(params) {
    Object.defineProperties(this, {
        errorFormat: hiddenPropertySettings,
        formatStr: hiddenPropertySettings,
        resultHandler: hiddenPropertySettings,
        exceptionHandler: hiddenPropertySettings,
        arg: hiddenPropertySettings,
        ignoreOptionsAfterArg: hiddenPropertySettings,
        util: hiddenPropertySettings
    });

    this.errorFormat = {
        error: '%{validator}',
        message: '%{message}',
        $options: true,
        $origin: true
    };
    this.formatStr = formatStr;
    this.resultHandler = function (result) {
        return result;
    };
    this.arg = 'arg';
    this.util = {};

    Object.assign(this, params);
}

/**
 * @param {String} name of validator
 * @param {Function|String|Array} validator, alias or validators array
 * @param {Object} params
 *
 * @returns {Validators} Validators instance
 */
function addValidator(name, validator, params) {
    var _this = this;
    var validators = validator instanceof Array ? validator : [validator];
    var validate = void 0;

    if (typeof validator === 'string') {
        validate = function validate() /*value, arg, options*/{
            return _this[validator].apply({ alias: name, _this: _this }, arguments);
        };
    } else {
        validate = function validate(value /*arg, options*/) {
            var args = Array.prototype.slice.call(arguments, 2);
            var arg1 = arguments[1];
            var arg2 = arguments[2];
            var _this2 = this && this._this || _this;
            var isSimpleArgsFormat = _this2[name][SIMPLE_ARGS_FORMAT] || _this2[SIMPLE_ARGS_FORMAT];
            var options = !isSimpleArgsFormat && isPlainObject(arg2) ? arg2 : {};

            if (arg1 != null && typeof arg1 !== 'boolean') {
                if (isPlainObject(arg1) || isSimpleArgsFormat) {
                    options = arg1;
                } else {
                    options[_this2[name][ARG] || _this2[ARG]] = arg1;
                    args.shift();
                }
            }

            for (var i = 0; i < validators.length; i++) {
                var base = validators[i];

                switch (typeof base === 'undefined' ? 'undefined' : _typeof(base)) {
                    case 'function':
                        validator = validatorWrapper(_this2, name, base);break;

                    case 'string':
                        validator = _this2[base];break;

                    case 'object':
                        validator = _this2[base[0]];
                        options = Object.assign({}, options, base[1]);
                }

                var error = validator.apply(this, [value, options].concat(args));

                if (error) {
                    return error;
                }
            }
        };
    }

    Object.assign(validate, params);

    validate.curry = function () /*arg, options*/{
        var _arguments = arguments;
        //Partial application
        return function (value) {
            return validate.apply(_this, [value].concat(Array.prototype.slice.call(_arguments)));
        };
    };

    _this[name] = validate;
}

/**
 * @param {String|Object} validatorName or validators map like {validator1: validator1Fn, validator2: validator2Fn, ...}
 * @param {Object} params for every validator
 *
 * @returns {Validators} Validators instance
 */
Validators.prototype.add = function (validatorName, validators, params) {
    var _this3 = this;

    if (typeof validatorName === 'string') {
        addValidator.call(this, validatorName, validators, params);
    } else {
        Object.keys(validatorName).forEach(function (key) {
            return addValidator.call(_this3, key, validatorName[key], validators);
        });
    }

    return this;
};

/**
 * Format any structure which contains pattern strings
 *
 * @param {String|Object|Function} message. Object will be processed recursively. Function will be executed
 * @param {Object} [values]
 *
 * @returns {String|Object} formatted string or object
 */
Validators.prototype.formatMessage = function (message, values) {
    var _this4 = this;

    if (typeof message === 'function') {
        message = message(values.value, values);
    }

    if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object') {
        var formattedMessage = {};

        Object.keys(message).forEach(function (key) {
            return formattedMessage[_this4.formatStr(key, values)] = _this4.formatStr(message[key], values);
        });

        if (message[MESSAGE]) {
            //Show not enumerable message of JS exception
            formattedMessage[MESSAGE] = this.formatStr(message[MESSAGE], values);
        }

        return formattedMessage;
    }

    return this.formatStr(message, values);
};

module.exports = function (options) {
    return new Validators(options);
};
},{}],14:[function(require,module,exports){
'use strict';

function setTimezoneOffset(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

function normalizeDateTime(date) {
    if (!date) {
        return new Date(date);
    }

    if (arguments.length > 1) {
        date = Array.prototype.slice.call(arguments);
    }

    if (Array.isArray(date)) {
        date = new (Function.prototype.bind.apply(Date, [null].concat(date)))();
    }

    var jsDate = new Date(date);

    if (date === Object(date)) {
        //Native or Moment.js date
        var momentBaseDate = date.creationData && date.creationData().input;

        if (!(momentBaseDate && (typeof momentBaseDate === 'number' || typeof momentBaseDate === 'string' && /:.+Z|GMT|[+-]\d\d:\d\d/.test(momentBaseDate)))) {
            setTimezoneOffset(jsDate); //Any data except moment.js date from timestamp or UTC string (UTC ISO format have to contains time)
        }

        return jsDate;
    }

    if (!isNaN(jsDate) && typeof date === 'string') {
        //ISO or RFC
        if (date.match(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/) && date.indexOf('GMT') === -1) {
            //RFC without GMT
            setTimezoneOffset(jsDate);
        }
    } else {
        //Timestamp (always in UTC)
        jsDate = new Date(Number(String(date).split('.').join('')));
    }

    return jsDate;
}

function normalizeDate(date, options) {
    date = normalizeDateTime(date);

    return (options || {}).noTime ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) : date;
}

module.exports = normalizeDate;
},{}]},{},[10])(10)
});