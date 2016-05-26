'use strict';

const validate       = require('../../lib/validate');
const validators     = require('../../lib/validators');
const errors         = require('../../lib/errors');
const chai           = require('chai');
const expect         = chai.expect;
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('validate', function() {
    it('returns rejected promise when unknown format is specified', function() {
        const object = { a: 1 };
        const schema = {
            a: {
                $validators: { required: true }
            }
        };
        const options = { format: 'unsupportedFormat' };

        const promise = validate(object, schema, options);

        return expect(promise).to.be.rejectedWith('Unknown format unsupportedFormat');
    });

    it('returns rejected promise when timeout is reached', function() {
        // todo: может, надо мокать validateObject?
        validators.async = function() {
            return new Promise(resolve => {
                setTimeout(resolve, 100);
            });
        };

        const object = { a: 1 };
        const schema = {
            a: {
                $validators: { async: true }
            }
        };
        const options = { timeout: 1 };

        const promise = validate(object, schema, options);

        return expect(promise).to.be.rejectedWith(errors.TimeoutError);
    });
});