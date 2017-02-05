'use strict';

/**
 * @param {Object} object
 * @param {string} [path='']
 * @param {Object} [flatObject={}]
 * 
 * @returns {Object}
 */
function flatten(object, path='', flatObject={}) {
    Object.keys(object).forEach(propertyName => {
        const propertyValue = object[propertyName];

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
module.exports = function(object) {
    return flatten(object);
};