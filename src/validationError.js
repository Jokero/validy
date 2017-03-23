'use strict';

function ValidationError(errors) {
    Error.call(this);

    if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
    this.errors = errors;
}

ValidationError.prototype = Object.create(Error.prototype);

module.exports = ValidationError;