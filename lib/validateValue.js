'use strict';

const validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, validatorsOptions, path, originalObject, object, options) {
    const validatorsResultsPromises = [];
    const validationErrors          = [];

    Object.keys(validatorsOptions).forEach(validatorName => {
        const validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        let validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, path, originalObject, object);
        }

        if (!validatorOptions) {
            return;
        }

        const validatorResult = validator.call(validator, value, validatorOptions, path, originalObject, object);
        
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