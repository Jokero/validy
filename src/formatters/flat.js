'use strict';

/**
 * @param {Object} object
 * @param {String} [path='']
 * @param {Object} [flattenObject={}]
 * 
 * @returns {Object}
 */
function flatten(object, path='', flattenObject={}) {
    Object.keys(object).forEach(propertyName => {
        const propertyValue = object[propertyName];

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
module.exports = function(object) {
    return flatten(object);
};