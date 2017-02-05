'use strict';

var validateObject = require('./validateObject');
var ValidationError = require('./validationError');
var formatters = require('./formatters');

var DEFAULT_OPTIONS = {
    format: 'flat',
    reject: false
};

/**
 * @param {Object}  object
 * @param {Object}  schema
 * @param {Object}  [options={}]
 * @param {string}    [options.format=flat]
 * @param {boolean}   [options.reject=false]
 *
 * @returns {Promise}
 */
module.exports = function (object, schema) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    options = Object.assign({}, DEFAULT_OPTIONS, options);

    return new Promise(function (resolve, reject) {
        var formatter = formatters[options.format];
        if (!formatter) {
            return reject(new Error('Unknown format ' + options.format));
        }

        validateObject(object, schema, object, []).then(function (validationErrors) {
            if (!validationErrors) {
                return resolve();
            }

            var formattedErrors = formatter(validationErrors);

            if (options.reject) {
                reject(new ValidationError(formattedErrors));
            } else {
                resolve(formattedErrors);
            }
        }).catch(reject);
    });
};