'use strict';

var validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function (value, validatorsOptions, object, fullObject, path) {
    var validatorsResultsPromises = [];
    var validationErrors = [];

    Object.keys(validatorsOptions).forEach(function (validatorName) {
        var validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        var validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, fullObject, path);
        }

        if (validatorOptions === false || validatorOptions === null || validatorOptions === undefined) {
            return;
        }

        var validatorResult = validator(value, validatorOptions, object, fullObject, path);

        var validatorResultPromise = Promise.resolve(validatorResult);
        validatorResultPromise.then(function (validationError) {
            if (validationError) {
                validationErrors.push(validationError);
            }
        });

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(function () {
        if (validationErrors.length) {
            return validationErrors;
        }
    });
};