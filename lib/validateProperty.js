'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {Object}   object
 * @param {Object}   originalObject
 * @param {String[]} path
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function (value, schema, object, originalObject, path, options) {
    var validatorsOptions = schema.$validators;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, object, originalObject, path);
    }

    var promise = void 0;
    if (validatorsOptions) {
        promise = validateValue(value, validatorsOptions, object, originalObject, path, options);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function (validationErrors) {
        if (validationErrors) {
            return validationErrors;
        }

        var validateObject = require('./validateObject');

        if (schema.$items || schema instanceof Array) {
            var _ret = function () {
                if (!(value instanceof Array)) {
                    return {
                        v: Promise.resolve(['Must be an array'])
                    };
                }

                var propertiesSchema = {};
                var itemSchema = schema.$items || schema[0];

                value.forEach(function (item, index) {
                    propertiesSchema[index] = itemSchema;
                });

                return {
                    v: validateObject(value, propertiesSchema, originalObject, path, options)
                };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        }

        if (Object.keys(schema).some(function (propertyName) {
            return !propertyName.startsWith('$');
        })) {
            if (!(value instanceof Object)) {
                return Promise.resolve(['Must be an object']);
            }

            return validateObject(value, schema, originalObject, path, options);
        }
    });
};