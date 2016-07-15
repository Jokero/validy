'use strict';

var validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {Object}   originalObject
 * @param {String[]} path
 * @param {Object}   options
 *
 * @returns {Promise}
 */
module.exports = function (object, schema, originalObject, path, options) {
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
            propertySchema = propertySchema(propertyValue, object, originalObject, propertyPath);
        }

        if (propertySchema) {
            var validationPromise = validateProperty(propertyValue, propertySchema, object, originalObject, propertyPath, options);

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