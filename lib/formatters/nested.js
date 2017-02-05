'use strict';

/**
 * Errors object has nested structure by default, so we just return object without any changes
 *
 * @param {Object} errors
 *
 * @returns {Object}
 */

module.exports = function (errors) {
  return errors;
};