'use strict';

const validators = require('common-validators');

validators.confirmOriginal = validators.confirm;
validators.add({
    confirm: function(value, options, object, fullObject, path) {
        const confirmOptions = {
            key: path[path.length - 1],
            comparedKey: options instanceof Object ? options.key : options
        };

        return this.confirmOriginal(object, confirmOptions);
    }
});

module.exports = validators;