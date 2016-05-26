'use strict';

const validateValue = require('./validateValue');
const utils         = require('./utils');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, schema, path, originalObject, object, options) {
    let validatorsOptions = schema.$validators;
    if (validatorsOptions instanceof Function) {
        validatorsOptions = validatorsOptions(value, path, originalObject, object);
    }

    let promise;
    if (validatorsOptions) {
        promise = validateValue(value, validatorsOptions, path, originalObject, object, options);
    } else {
        promise = Promise.resolve();
    }

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

            return validateObject(value, propertiesSchema, path, originalObject, options);
        }
        
        if (utils.hasSchemaAtLeastOneProperty(schema)) {
            if (!(value instanceof Object)) {
                return Promise.resolve(['Must be an object']);
            }

            return validateObject(value, schema, path, originalObject, options);
        }
    });
};