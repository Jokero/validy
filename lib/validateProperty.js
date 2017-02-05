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