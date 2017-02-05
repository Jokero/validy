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