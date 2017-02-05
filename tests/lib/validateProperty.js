'use strict';

const validateProperty = require('../../lib/validateProperty');
const chai             = require('chai');
const expect           = chai.expect;
const chaiAsPromised   = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('validateProperty', function() {
    it("returns fulfilled promise with error when property must be an object but it's not", function() {
        const schema = {
            name: {
                $validate: {
                    required: true
                }
            }
        };
        const value = 'Sergei Yesenin';

        const promise = validateProperty(value, schema, {}, {}, []);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors).to.be.an.instanceof(Array);
            expect(errors[0].error).to.equal('object');
            expect(errors[0].message).to.equal('must be an object');
        });
    });

    it("returns fulfilled promise with error when property must be an array but it's not", function() {
        const schema = [{
            name: {
                $validate: {
                    required: true
                }
            }
        }];
        const value = 'Sergei Yesenin';

        const promise = validateProperty(value, schema, {}, {}, []);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors).to.be.an.instanceof(Array);
            expect(errors[0].error).to.equal('array');
            expect(errors[0].message).to.equal('must be an array');
        });
    });

    it("resolves validators options when they are function", function() {
        const schema = {
            name: {
                $validate: () => ({ required: true })
            }
        };
        const value = {};

        const promise = validateProperty(value, schema, {}, {}, []);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors.name).to.be.an.instanceof(Array);
            expect(errors.name[0].error).to.equal('required');
        });
    });

    context('works with array schema', function() {
        it('defined using []', function() {
            const schema = [{
                name: {
                    $validate: {
                        required: true
                    }
                }
            }];

            const value = [
                { name: 'name' },
                { name2: 'name2' } // invalid item ('1.name' is required)
            ];

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors[1].name).to.be.an.instanceof(Array);
                expect(errors[1].name[0].error).to.equal('required');
            });
        });

        it('defined using $items', function() {
            const schema = {
                $items: {
                    name: {
                        $validate: {
                            required: true
                        }
                    }
                }
            };

            const value = [
                { name: 'name' },
                { name2: 'name2' } // invalid items ('1.name' is required)
            ];

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors[1].name).to.be.an.instanceof(Array);
                expect(errors[1].name[0].error).to.equal('required');
            });
        });
    });
});