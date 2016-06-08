'use strict';

const util = require('util');

/**
 * @param {String} [message=Validation timeout]
 * 
 * @constructor
 */
function TimeoutError(message='Validation timeout') {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name    = this.constructor.name;
    this.message = message;
}

util.inherits(TimeoutError, Error);

module.exports = TimeoutError;