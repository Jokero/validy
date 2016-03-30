const validateProperty = require('./validateProperty');

/**
 * @param {Object}   object
 * @param {Object}   schema
 * @param {String[]} path
 * @param {Object}   originalObject
 * @param {Object}   [options={}]
 * @param {Number}     [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, path, originalObject, options={}) {
    const validationPromises = [];
    const validationErrors = {};

    Object.keys(schema).forEach(propertyName => {
        if (propertyName.startsWith('$')) {
            return;
        }

        const propertyValue = object[propertyName];
        const propertyPath  = path.concat(propertyName);
        let propertySchema  = schema[propertyName];

        if (propertySchema instanceof Function) {
            propertySchema = propertySchema(propertyValue, propertyPath, originalObject, object);
        }

        if (propertySchema) {
            const validationPromise = validateProperty(propertyValue,
                                                       propertySchema,
                                                       propertyPath,
                                                       originalObject,
                                                       object,
                                                       options);

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