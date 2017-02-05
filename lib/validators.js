'use strict';

var validators = require('common-validators');

validators.confirmOriginal = validators.confirm;
validators.add({
    confirm: function confirm(value, options, object, fullObject, path) {
        var confirmOptions = {
            key: path[path.length - 1],
            comparedKey: options instanceof Object ? options.key : options
        };

        return this.confirmOriginal(object, confirmOptions);
    }
});

module.exports = validators;