'use strict';

const validateValue  = require('../../lib/validateValue');
const validators     = require('../../lib/validators');
const sinon          = require('sinon');
const sinonChai      = require('sinon-chai');
const chai           = require('chai');
const expect         = chai.expect;
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('validateValue', function() {
    it('throws exception when validator does not exist', function() {
        const value = 'some value';
        const validatorsOptions = {
            existsInDatabase: true
        };

        const fn = () => validateValue(value, validatorsOptions, {}, {}, []);
        expect(fn).to.throw('Unknown validator existsInDatabase');
    });

    it("resolves validator options when they are function", function() {
        const value = 'short string';
        const validatorsOptions = {
            minLength: () => ({ arg: 20 })
        };

        const promise = validateValue(value, validatorsOptions, {}, {}, []);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors).to.be.an.instanceof(Array);
            expect(errors[0].error).to.equal('minLength');
        });
    });

    it('calls validator with current object, full object and path to property', function() {
        const fullObject = {
            a: {
                b: 'some value'
            }
        };
        const object = fullObject.a;
        const path = ['a', 'b'];
        const value = fullObject.a.b;
        const validatorsOptions = {
            required: {
                message: 'custom required message'
            }
        };

        const requiredSpy = sinon.spy(validators, 'required');

        validateValue(value, validatorsOptions, object, fullObject, path);

        expect(requiredSpy).to.have.been.calledOnce;
        expect(requiredSpy).to.have.been.calledWith(value, validatorsOptions.required, object, fullObject, path);

        requiredSpy.reset();
    });

    context('ignores validator', function() {
        [false, null, undefined].forEach(options => {
            it(`when its options are ${options}`, function() {
                const value = null;
                const validatorsOptions = {
                    required: options
                };

                const promise = validateValue(value, validatorsOptions, {}, {}, []);

                return expect(promise).to.be.fulfilled.then(errors => {
                    expect(errors).to.equal(undefined);
                });
            });
        });
    });

    context('uses custom validator', function() {
        it('sync validator', function() {
            const greaterThanValidator = function(value, options) {
                if (typeof value === 'number') {
                    const minValue = options.arg;
                    if (value <= minValue) {
                        return '%{value} is not greater than %{arg}';
                    }
                }
            };

            validators.add('greaterThan', greaterThanValidator);

            const value = 10;
            const validatorsOptions = {
                greaterThan: 20
            };

            const promise = validateValue(value, validatorsOptions, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.an.instanceof(Array);
                expect(errors[0].error).to.equal('greaterThan');
                expect(errors[0].message).to.equal(`${value} is not greater than ${validatorsOptions.greaterThan}`);
            });
        });

        it('async validator', function() {
            const existsInDatabaseValidator = function(value) {
                return Promise.resolve('%{value} does not exist');
            };

            validators.add('existsInDatabase', existsInDatabaseValidator);

            const value = 1;
            const validatorsOptions = {
                existsInDatabase: true
            };

            const promise = validateValue(value, validatorsOptions, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.an.instanceof(Array);
                expect(errors[0].error).to.equal('existsInDatabase');
                expect(errors[0].message).to.equal(`${value} does not exist`);
            });
        });
    });
});