'use strict';

var util = require('util');

/**
 * @param {String} [message=Validation timeout]
 * 
 * @constructor
 */
function TimeoutError() {
  var message = arguments.length <= 0 || arguments[0] === undefined ? 'Validation timeout' : arguments[0];

  Error.call(this);
  Error.captureStackTrace(this, this.constructor);

  this.name = this.constructor.name;
  this.message = message;
}

util.inherits(TimeoutError, Error);

module.exports = TimeoutError;