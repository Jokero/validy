'use strict';

var validateObject = require('./validateObject');
var errors = require('./errors');
var formatters = require('./formatters');

var DEFAULT_FORMAT = 'nested';
var DEFAULT_TIMEOUT = 10000;

/**
 * @param {Object} object
 * @param {Object} schema
 * @param {Object} [options={}]
 * @param {Number}   [options.timeout=10000]
 * @param {String}   [options.format=nested]
 * @param {Number}   [options.maxPropertyErrorsCount] - By default all property errors will be returned. Must be >= 1
 *
 * @returns {Promise}
 */
module.exports = function (object, schema) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var format = options.format || DEFAULT_FORMAT;
    var timeout = options.timeout || DEFAULT_TIMEOUT;

    return new Promise(function (resolve, reject) {
        var formatter = formatters[format];
        if (!formatter) {
            return reject(new Error('Unknown format ' + format));
        }

        var timeoutObject = setTimeout(function () {
            reject(new errors.TimeoutError());
        }, timeout);

        validateObject(object, schema, object, [], options).then(function (result) {
            clearTimeout(timeoutObject);
            resolve(formatter(result));
        }).catch(function (err) {
            clearTimeout(timeoutObject);
            reject(err);
        });
    });
};