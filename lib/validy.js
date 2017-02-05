'use strict';

var validate = require('./validate');

validate.validators = require('./validators');
validate.formatters = require('./formatters');
validate.ValidationError = require('./validationError');

module.exports = validate;