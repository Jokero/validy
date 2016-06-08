'use strict';

/**
 * @param {Object} schema
 * 
 * @returns {Boolean}
 */
exports.hasSchemaAtLeastOneProperty = function(schema) {
    for (let propertyName in schema) {
        if (!propertyName.startsWith('$')) {
            return true;
        }
    }
    
    return false;
};