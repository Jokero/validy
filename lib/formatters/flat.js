'use strict';

/**
 * @param {Object} object
 * @param {String} [path='']
 * @param {Object} [flattenObject={}]
 * 
 * @returns {Object}
 */

function flatten(object) {
    var path = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
    var flattenObject = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    Object.keys(object).forEach(function (propertyName) {
        var propertyValue = object[propertyName];

        if (propertyValue instanceof Object && !(propertyValue instanceof Array)) {
            flatten(propertyValue, path + propertyName + '.', flattenObject);
        } else {
            flattenObject[path + propertyName] = propertyValue;
        }
    });

    return flattenObject;
}

/**
 * @param {Object} object
 * 
 * @returns {Object}
 */
module.exports = function (object) {
    return flatten(object);
};