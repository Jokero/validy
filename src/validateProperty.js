'use strict';

const validateValue = require('./validateValue');

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
module.exports = function(value, schema, object, fullObject, path) {
    let validatorsOptions = schema.$validate;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, object, fullObject, path);
    }

    const promise = validatorsOptions instanceof Object
                        ? validateValue(value, validatorsOptions, object, fullObject, path)
                        : Promise.resolve();

    return promise.then(validationErrors => {
        if (validationErrors) {
            return validationErrors;
        }

        const validateObject = require('./validateObject');

        if (schema.$items || schema[0]) {
            if (!(value instanceof Array)) {
                return Promise.resolve([{
                    error:   'array',
                    message: 'must be an array'
                }]);
            }

            const propertiesSchema = {};
            const itemSchema = schema.$items || schema[0];

            value.forEach((item, index) => propertiesSchema[index] = itemSchema);

            return validateObject(value, propertiesSchema, fullObject, path);
        }

        if (Object.keys(schema).some(propertyName => !propertyName.startsWith('$'))) {
            if (!(value instanceof Object)) {
                return Promise.resolve([{
                    error:   'object',
                    message: 'must be an object'
                }]);
            }

            return validateObject(value, schema, fullObject, path);
        }
    });
};