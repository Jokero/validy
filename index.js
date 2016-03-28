const validate     = require('./lib/validate');
const TimeoutError = require('./lib/errors/timeoutError');
const validators   = require('./lib/validators');

validate.errors = {
    TimeoutError: TimeoutError
};

Object.defineProperty(validate, 'validators', {
    get: function () {
        return validators.getAll();
    },
    set: function($validators) {
        validators.setAll($validators);
    }
});

module.exports = validate;