const validators = require('./validators');

/**
 * @param {*}        value
 * @param {Object}   validatorsConfig
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, validatorsConfig, path, originalObject, object, options) {
    var validator, validatorConfig;
    var validatorResult, validatorResultPromise, validatorsResultsPromises = [];

    Object.keys(validatorsConfig).forEach(function(validatorName) {
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

        validatorsResultsPromises.push(validatorResultPromise);
    });

    return Promise.all(validatorsResultsPromises).then(function(results) {
        var validationErrors = _.compact(results);

        if (validationErrors.length) {
            var maxPropertyErrorsCount = options.maxPropertyErrorsCount || validationErrors.length;
            return validationErrors.slice(0, maxPropertyErrorsCount);
        }
    });
};