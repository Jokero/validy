let validators = {};

/**
 * @returns {Object}
 */
exports.getAll = function() {
    return validators;
};

/**
 * @param {String} name
 *
 * @returns {Function}
 */
exports.get = function(name) {
    return validators[name];
};

/**
 * @param {Object} $validators
 */
exports.setAll = function($validators) {
    validators = $validators;
};