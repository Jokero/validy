const validate     = require('./lib/validate');
const validators   = require('./lib/validators');
const TimeoutError = require('./lib/errors/timeoutError');

validate.validators = validators;
validate.errors     = {
    TimeoutError: TimeoutError
};

module.exports = validate;