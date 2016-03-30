const validateObject = require('./validateObject');
const TimeoutError   = require('./errors/timeoutError');
const formatters     = require('./formatters');

const DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} schema
 * @param {Object} [options={}]
 * @param {Number}   [options.timeout=10000]
 * @param {String}   [options.format]
 * @param {Number}   [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, options = {}) {
    return new Promise((resolve, reject) => {
        const timeout = options.timeout || DEFAULT_TIMEOUT;
        const format  = options.format;

        if (format && !formatters[format]) {
            return reject(new Error('Unknown format ' + format));
        }

        const timeoutObject = setTimeout(() => {
            reject(new TimeoutError());
        }, timeout);
        
        validateObject(object, schema, [], object, options)
            .then(result => {
                clearTimeout(timeoutObject);

                if (format) {
                    result = formatters[format](result);
                }

                resolve(result);
            })
            .catch(err => {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
};