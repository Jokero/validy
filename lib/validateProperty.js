'use strict';

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
            if (!(value instanceof Array)) {
                return Promise.resolve([{
                    error: 'array',
                    message: 'must be an array'
                }]);
            }

            var propertiesSchema = {};
            var itemSchema = schema.$items || schema[0];

            value.forEach(function (item, index) {
                return propertiesSchema[index] = itemSchema;
            });

            return validateObject(value, propertiesSchema, fullObject, path);
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