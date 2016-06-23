'use strict';

const validators = require('./validators');

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
module.exports = function(value, validatorsOptions, object, originalObject, path, options) {
    const validatorsResultsPromises = [];
    const validationErrors          = [];

    Object.keys(validatorsOptions).forEach(validatorName => {
        const validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        let validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, originalObject, path);
        }

        if (!validatorOptions) {
            return;
        }

        const validatorResult = validator(value, validatorOptions, object, originalObject, path);
        
        const validatorResultPromise = Promise.resolve(validatorResult);
        validatorResultPromise.then(validationError => {
            if (validationError) {
                validationErrors.push(validationError);
            }
        });

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(() => {
        if (validationErrors.length) {
            if (options.maxPropertyErrorsCount) {
                return validationErrors.slice(0, options.maxPropertyErrorsCount);
            }
            
            return validationErrors;
        }
    });
};