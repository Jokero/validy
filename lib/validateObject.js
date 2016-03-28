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
    
    const validationPromises = [];
    const validationErrors = {};
    let validationPromise;
    
    Object.keys(config).forEach(propertyName => {
        propertyValue  = object[propertyName];
        propertyPath   = path.concat(propertyName);
        propertyConfig = config[propertyName];
        
        if (propertyConfig instanceof Function) {
            propertyConfig = propertyConfig(propertyValue, propertyPath, originalObject, object);
        }

        if (propertyConfig && (propertyConfig.validators || propertyConfig.properties || propertyConfig.items)) {
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