'use strict';

var validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {Object}   object
 * @param {Object}   originalObject
 * @param {String[]} path
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function (value, validatorsOptions, object, originalObject, path, options) {
    var validatorsResultsPromises = [];
    var validationErrors = [];

    Object.keys(validatorsOptions).forEach(function (validatorName) {
        var validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        var validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, originalObject, path);
        }

        if (!validatorOptions) {
            return;
        }

        var validatorResult = validator(value, validatorOptions, object, originalObject, path);

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
            if (options.maxPropertyErrorsCount) {
                return validationErrors.slice(0, options.maxPropertyErrorsCount);
            }

            return validationErrors;
        }
    });
};