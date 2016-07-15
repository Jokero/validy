'use strict';

const validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   originalObject
 * @param {String[]} path
 * @param {Object}   options
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, originalObject, path, options) {
    const validationPromises = [];
    const validationErrors   = {};

    Object.keys(schema).forEach(propertyName => {
        if (propertyName.startsWith('$')) {
            return;
        }

        const propertyValue = object[propertyName];
        const propertyPath  = path.concat(propertyName);
        
        let propertySchema = schema[propertyName];
        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, object, originalObject, propertyPath);
        }

        if (propertySchema) {
            const validationPromise = validateProperty(propertyValue,
                                                       propertySchema,
                                                       object,
                                                       originalObject,
                                                       propertyPath,
                                                       options);

            validationPromise.then(validationError => {
                if (validationError) {
                    validationErrors[propertyName] = validationError;
                }
            });

            validationPromises.push(validationPromise);
        }
    });

    return Promise.all(validationPromises).then(() => {
        if (Object.keys(validationErrors).length) {
            return validationErrors;
        }
    });
};