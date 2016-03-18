const validateValue = require('./validateValue');

/**
 * @param {*}        value
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   object
 * @param {Object}   [options={}]
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(value, config, path, originalObject, object, options={}) {
    let validators = config.validators;
    if (validators instanceof Function) {
        validators = validators(value, path, originalObject, object);
    }

    if (config.properties instanceof Object) {
        validators = Object.assign({ type: 'object' }, validators);
    } else if (config.items instanceof Object) {
        validators = Object.assign({ type: 'array' }, validators);
    }

    let promise;
    if (validators instanceof Object) {
        promise = validateValue(value, validators, path, originalObject, object, options);
    } else {
        promise = Promise.resolve();
    }

    return promise.then(validationErrors => {
        if (validationErrors) {
            return validationErrors;
        }

        const validateObject = require('./validateObject');
        let properties;

        if (config.properties instanceof Object && value instanceof Object) {
            properties = config.properties;
            if (properties instanceof Function) {
                properties = properties(value, path, originalObject, object);
            }
            
            return validateObject(value, properties, path, originalObject, options);
        }

        if (config.items instanceof Object && value instanceof Array) {
            properties = Array(value.length).fill(config.items);

            return validateObject(value, properties, path, originalObject, options);
        }
    });
};