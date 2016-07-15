'use strict';

const validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {Object}   object
 * @param {Object}   originalObject
 * @param {String[]} path
 * @param {Object}   options
 *
 * @returns {Promise}
 */
module.exports = function(value, schema, object, originalObject, path, options) {
    let validatorsOptions = schema.$validators;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, object, originalObject, path);
    }

    const promise = validatorsOptions
                        ? validateValue(value, validatorsOptions, object, originalObject, path, options)
                        : Promise.resolve();

    return promise.then(validationErrors => {
        if (validationErrors) {
            return validationErrors;
        }

        const validateObject = require('./validateObject');

        if (schema.$items || schema instanceof Array) {
            if (!(value instanceof Array)) {
                return Promise.resolve(['Must be an array']);
            }

            const propertiesSchema = {};
            const itemSchema       = schema.$items || schema[0];

            value.forEach((item, index) => {
                propertiesSchema[index] = itemSchema;
            });

            return validateObject(value, propertiesSchema, originalObject, path, options);
        }

        if (Object.keys(schema).some(propertyName => !propertyName.startsWith('$'))) {
            if (!(value instanceof Object)) {
                return Promise.resolve(['Must be an object']);
            }

            return validateObject(value, schema, originalObject, path, options);
        }
    });
};