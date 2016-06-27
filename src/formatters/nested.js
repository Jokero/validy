'use strict';

/**
 * Errors object has nested structure by default, so we just return object without any changes
 *
 * @param {Object} object
 *
 * @returns {Object}
 */
module.exports = function(object) {
    return object;
};