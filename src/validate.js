'use strict';

const validateObject  = require('./validateObject');
const ValidationError = require('./validationError');
const formatters      = require('./formatters');

const DEFAULT_OPTIONS = {
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
module.exports = function(object, schema, options={}) {
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    return new Promise((resolve, reject) => {
        const formatter = formatters[options.format];
        if (!formatter) {
            return reject(new Error(`Unknown format ${options.format}`));
        }

        validateObject(object, schema, object, [])
            .then(validationErrors => {
                if (!validationErrors) {
                    return resolve();
                }

                const formattedErrors = formatter(validationErrors);

                if (options.reject) {
                    reject(new ValidationError(formattedErrors));
                } else {
                    resolve(formattedErrors);
                }
            })
            .catch(reject);
    });
};