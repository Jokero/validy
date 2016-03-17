const validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   options
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, config, path, originalObject, object, options) {
    var promise;

    var validators;
    if (config.validators instanceof Function) {
        validators = config.validators(value, path, originalObject, object);
    } else {
        validators = config.validators;
    }

    if (config.properties instanceof Object) {
        validators = Object.assign({ type: 'object' }, validators);
    } else if (config.items instanceof Object) {
        validators = Object.assign({ type: 'array' }, validators);
    }

    if (validators instanceof Object) {
        promise = validateValue(value, validators, path, originalObject, object, options);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(function(validationErrors) {
        if (validationErrors) {
            return validationErrors;
        }

        const validateObject = require('./validateObject');
        var properties;

        if (config.properties instanceof Object && value instanceof Object) {
            if (config.properties instanceof Function) {
                properties = config.properties(value, path, originalObject, object);
            } else {
                properties = config.properties;
            }
            
            return validateObject(value, properties, path, originalObject, options);
        }

        if (config.items instanceof Object && value instanceof Array) {
            properties = {};
            value.forEach(function(item, index) {
                properties[index] = config.items;
            });

            return validateObject(value, properties, path, originalObject, options);
        }
    });
};