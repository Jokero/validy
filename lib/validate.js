'use strict';

const validateObject = require('./validateObject');
const errors         = require('./errors');
const formatters     = require('./formatters');

const DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} schema
 * @param {Object} [options={}]
 * @param {Number}   [options.timeout=10000]
 * @param {String}   [options.format] - There is no default formatter
 * @param {Number}   [options.maxPropertyErrorsCount] - By default all property errors will be returned. Must be >= 1
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, options) {
    options = options || {};
    
    return new Promise((resolve, reject) => {
        const timeout = options.timeout || DEFAULT_TIMEOUT;
        const format  = options.format;

        if (format && !formatters[format]) {
            return reject(new Error('Unknown format ' + format));
        }

        const timeoutObject = setTimeout(() => {
            reject(new errors.TimeoutError());
        }, timeout);
        
        validateObject(object, schema, object, [], options)
            .then(result => {
                clearTimeout(timeoutObject);

                if (format) {
                    const formattedResult = formatters[format](result);
                    return resolve(formattedResult);
                }

                resolve(result);
            })
            .catch(err => {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
};