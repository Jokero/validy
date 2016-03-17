const util = require('util');

/**
 * @param {String} [message=Validation timeout]
 * @class
 */
function TimeoutError(message) {
    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.name    = this.constructor.name;
    this.message = message || 'Validation timeout';
}

util.inherits(TimeoutError, Error);

module.exports = TimeoutError;