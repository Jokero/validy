'use strict';

var validate = require('./validate');

validate.validators = require('./validators');
validate.formatters = require('./formatters');
validate.errors = require('./errors');

module.exports = validate;