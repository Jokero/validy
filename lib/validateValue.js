const validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsConfig
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   [options={}]
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, validatorsConfig, path, originalObject, object, options={}) {
    let validator, validatorConfig;
    let validatorResult, validatorResultPromise;
    
    const validatorsResultsPromises = [];
    const validationErrors = [];

    Object.keys(validatorsConfig).forEach(validatorName => {
        validator = validators[validatorName];
        if (!validator) {
            throw new Error('Unknown validator ' + validatorName);
        }

        validatorConfig = validatorsConfig[validatorName];
        if (validatorConfig instanceof Function) {
            validatorConfig = validatorConfig(value, path, originalObject, object);
        }

        if (!validatorConfig) {
            return;
        }

        validatorResult        = validator.call(validator, value, validatorConfig, originalObject);
        validatorResultPromise = Promise.resolve(validatorResult);
        
        validatorResultPromise.then(validationError => {
            if (validationError) {
                validationErrors.push(validationError);
            }
        });

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(() => {
        if (validationErrors.length) {
            const maxPropertyErrorsCount = options.maxPropertyErrorsCount || validationErrors.length;
            return validationErrors.slice(0, maxPropertyErrorsCount);
        }
    });
};