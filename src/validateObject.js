'use strict';

const validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, fullObject, path) {
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
            propertySchema = propertySchema(propertyValue, object, fullObject, propertyPath);
        }

        if (propertySchema instanceof Object) {
            const validationPromise = validateProperty(propertyValue, propertySchema, object, fullObject, propertyPath);

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