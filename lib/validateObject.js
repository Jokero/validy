const validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   config
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   [options={}]
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(object, config, path, originalObject, options={}) {
    let propertyValue, propertyPath, propertyConfig;
    
    let validationPromise;
    const validationPromises = [];
    const validationErrors = {};

    Object.keys(config).forEach(propertyName => {
        propertyValue  = object[propertyName];
        propertyPath   = path.concat(propertyName);
        propertyConfig = config[propertyName];
        
        if (propertyConfig instanceof Function) {
            propertyConfig = propertyConfig(propertyValue, propertyPath, originalObject, object);
        }

        if (propertyConfig instanceof Object
            && (propertyConfig.validators instanceof Object
                || propertyConfig.properties instanceof Object
                || propertyConfig.items instanceof Object)) {

            validationPromise = validateProperty(propertyValue, propertyConfig, propertyPath, originalObject, object, options);

            validationPromise.then(validationError => {
                if (validationError) {
                    validationErrors[propertyName] = validationError;
                }
            });

            validationPromises.push(validationPromise);
        }
    });

    return Promise.all(validationPromises).then(() => {
        if (Object.keys(validationErrors).length) {
            return validationErrors;
        }
    });
};