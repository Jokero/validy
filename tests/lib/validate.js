'use strict';

const validate        = require('../../lib/validate');
const ValidationError = require('../../lib/validationError');
const validators      = require('../../lib/validators');
const chai            = require('chai');
const expect          = chai.expect;
const chaiAsPromised  = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('validate', function() {
    it('returns rejected promise when unknown format is specified', function() {
        const object = { a: 1 };
        const schema = {
            a: {
                $validate: {
                    required: true
                }
            }
        };
        const options = { format: 'newFormat' };

        const promise = validate(object, schema, options);

        return expect(promise).to.be.rejectedWith('Unknown format newFormat');
    });

    it('returns fulfilled promise when there are no errors', function() {
        const object = { a: 1 };
        const schema = {
            a: {
                $validate: {
                    required: true
                }
            }
        };

        const promise = validate(object, schema);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors).to.equal(undefined);
        });
    });

    it('returns fulfilled promise on validation error by default', function() {
        const object = {};
        const schema = {
            a: {
                $validate: {
                    required: true
                }
            }
        };

        const promise = validate(object, schema);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors).to.have.property('a');
        });
    });

    it('returns rejected with ValidationError promise on validation error when reject=true', function() {
        const object = {};
        const schema = {
            a: {
                $validate: {
                    required: true
                }
            }
        };
        const options = { reject: true };

        const promise = validate(object, schema, options);

        return expect(promise).to.be.rejectedWith(ValidationError);
    });

    it('returns rejected promise on application error', function() {
        const object = {};
        const schema = {
            a: {
                $validate: {
                    throwException: true
                }
            }
        };

        validators.add('throwException', () => {
            throw new Error('Ooops');
        });

        const promise = validate(object, schema);

        return expect(promise).to.be.rejectedWith('Ooops');
    });
});