'use strict';

const validate = require('./lib/validate');

validate.validators = require('./lib/validators');
validate.formatters = require('./lib/formatters');
validate.errors     = require('./lib/errors');

module.exports = validate;