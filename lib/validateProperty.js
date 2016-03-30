const validateValue = require('./validateValue');
const utils = require('./utils');

/**
 * @param {*}        value
 * @param {Object}   schema
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   [options={}]
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, schema, path, originalObject, object, options={}) {
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

        if (schema.$items || schema instanceof Array || utils.hasSchemaAtLeastOneProperty(schema)) {
            const validateObject = require('./validateObject');
            let propertiesSchema;

            if (schema.$items || schema instanceof Array) {
                if (!(value instanceof Array)) {
                    return Promise.resolve(['Must be an array']);
                }

                const propertySchema = schema.$items || schema[0];
                propertiesSchema = Array(value.length).fill(propertySchema);
            } else {
                if (!(value instanceof Object)) {
                    return Promise.resolve(['Must be an object']);
                }

                propertiesSchema = schema;
                if (propertiesSchema instanceof Function) {
                    propertiesSchema = propertiesSchema(value, path, originalObject, object);
                }
            }

            return validateObject(value, propertiesSchema, path, originalObject, options);
        }
    });
};