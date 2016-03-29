/**
 * todo:
 * 1) переименовать config в schema
 */
const validate   = require('./lib/validate');
const validators = require('./lib/validators');

validate.formatters = require('./lib/formatters');
validate.errors     = require('./lib/errors');

Object.defineProperty(validate, 'validators', {
    get: function() {
        return validators.getAll();
    },
    set: function($validators) {
        validators.setAll($validators);
    }
});

module.exports = validate;