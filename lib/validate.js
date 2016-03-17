const validateObject = require('./validateObject');
const TimeoutError   = require('./errors/timeoutError');

const DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} config
 * @param {Object} [options]
 * @param {Number}   [options.timeout=10000]
 * @param {Number}   [options.maxPropertyErrorsCount]
 *
 * @returns {Promise}
 */
module.exports = function(object, config, options) {
    options = options || {};

    const timeout = options.timeout || DEFAULT_TIMEOUT;

    return new Promise(function(resolve, reject) {
        const timeoutObject = setTimeout(function() {
            reject(new TimeoutError());
        }, timeout);

        // validateObject не должен исключение кидать
        validateObject(object, config, [], object, options)
            .then(function(result) {
                clearTimeout(timeoutObject);
                resolve(result);
            })
            .catch(function(err) {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
};