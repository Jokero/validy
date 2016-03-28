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

    const promise = validators ? validateValue(value, validators, path, originalObject, object, options) : Promise.resolve();

    return promise.then(validationErrors => {
        if (validationErrors) {
            return validationErrors;
        }

        if (config.properties || config.items) {
            const validateObject = require('./validateObject');
            let properties;
            
            if (config.properties) {
                if (!(value instanceof Object)) {
                    return Promise.resolve(['Must be an object']);
                }
                
                properties = config.properties;
                if (properties instanceof Function) {
                    properties = properties(value, path, originalObject, object);
                }
            } else {
                if (!(value instanceof Array)) {
                    return Promise.resolve(['Must be an array']);
                }
                
                properties = Array(value.length).fill(config.items);
            }

            return validateObject(value, properties, path, originalObject, options);
        }
    });
};