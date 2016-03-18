const validateObject = require('./validateObject');
const TimeoutError   = require('./errors/timeoutError');

const DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options={}]
 * @param {Number}   [options.timeout=10000]
 * @param {Number}   [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(object, config, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;

    return new Promise((resolve, reject) => {
        const timeoutObject = setTimeout(() => {
            reject(new TimeoutError());
        }, timeout);
        
        validateObject(object, config, [], object, options)
            .then(result => {
                clearTimeout(timeoutObject);
                resolve(result);
            })
            .catch(err => {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
};