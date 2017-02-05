'use strict';

const validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsOptions
 * @param {Object}   object
 * @param {Object}   fullObject
 * @param {string[]} path
 *
 * @returns {Promise}
 */
module.exports = function(value, validatorsOptions, object, fullObject, path) {
    const validatorsResultsPromises = [];
    const validationErrors          = [];

    Object.keys(validatorsOptions).forEach(validatorName => {
        const validator = validators[validatorName];
        if (!validator) {
            throw new Error(`Unknown validator ${validatorName}`);
        }

        let validatorOptions = validatorsOptions[validatorName];
        if (validatorOptions instanceof Function) {
            validatorOptions = validatorOptions(value, object, fullObject, path);
        }

        if (validatorOptions === false || validatorOptions === null || validatorOptions === undefined) {
            return;
        }

        const validatorResult = validator(value, validatorOptions, object, fullObject, path);
        
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
            return validationErrors;
        }
    });
};