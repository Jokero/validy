'use strict';

/**
 * @param {Object} object
 * @param {string} [path='']
 * @param {Object} [flatObject={}]
 * 
 * @returns {Object}
 */

function flatten(object) {
    var path = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    var flatObject = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    Object.keys(object).forEach(function (propertyName) {
        var propertyValue = object[propertyName];

        if (propertyValue instanceof Object && !(propertyValue instanceof Array)) {
            flatten(propertyValue, path + propertyName + '.', flatObject);
        } else {
            flatObject[path + propertyName] = propertyValue;
        }
    });

    return flatObject;
}

/**
 * @param {Object} object
 * 
 * @returns {Object}
 */
module.exports = function (object) {
    return flatten(object);
};