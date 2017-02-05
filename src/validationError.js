'use strict';

class ValidationError extends Error {
    constructor(errors) {
        super();

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }

        this.name   = this.constructor.name;
        this.errors = errors;
    }
}

module.exports = ValidationError;