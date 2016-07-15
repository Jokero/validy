'use strict';

const validateObject = require('./validateObject');
const errors         = require('./errors');
const formatters     = require('./formatters');

const DEFAULT_FORMAT  = 'nested';
const DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} schema
 * @param {Object} [options={}]
 * @param {String}   [options.format=nested]
 * @param {Number}   [options.timeout=10000]
 *
 * @returns {Promise}
 */
module.exports = function(object, schema, options={}) {
    const format  = options.format  || DEFAULT_FORMAT;
    const timeout = options.timeout || DEFAULT_TIMEOUT;

    return new Promise((resolve, reject) => {
        const formatter = formatters[format];
        if (!formatter) {
            return reject(new Error('Unknown format ' + format));
        }

        const timeoutObject = setTimeout(() => {
            reject(new errors.TimeoutError());
        }, timeout);
        
        validateObject(object, schema, object, [], options)
            .then(result => {
                clearTimeout(timeoutObject);
                resolve(formatter(result));
            })
            .catch(err => {
                clearTimeout(timeoutObject);
                reject(err);
            });
    });
};