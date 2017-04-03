'use strict';

const validateProperty = require('../../lib/validateProperty');
const chai             = require('chai');
const expect           = chai.expect;
const chaiAsPromised   = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('validateProperty', function() {
    context('supports schemas for arrays', function() {
        it('defined using []', function() {
            const value = [
                { name: 'name' },
                { name2: 'name2' } // invalid item ('1.name' is required)
            ];

            const schema = [{
                name: {
                    $validate: {
                        required: true
                    }
                }
            }];

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors[1].name).to.be.an.instanceof(Array);
                expect(errors[1].name[0].error).to.equal('required');
            });
        });

        it('defined using $items', function() {
            const value = [
                { name: 'name' },
                { name2: 'name2' } // invalid items ('1.name' is required)
            ];

            const schema = {
                $items: {
                    name: {
                        $validate: {
                            required: true
                        }
                    }
                }
            };

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors[1].name).to.be.an.instanceof(Array);
                expect(errors[1].name[0].error).to.equal('required');
            });
        });

        it("returns 'must be an array' error when property is expected to be an array but it's not", function() {
            const value = 'Sergei Yesenin';
            const schema = [{
                name: {
                    $validate: {
                        string: true
                    }
                }
            }];

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.an.instanceof(Array);
                expect(errors[0].error).to.equal('array');
                expect(errors[0].message).to.equal('must be an array');
            });
        });

        it("does not return 'must be an array' error when property is undefined", function() {
            const value = undefined;
            const schema = [{
                name: {
                    $validate: {
                        string: true
                    }
                }
            }];

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.undefined;
            });
        });
    });

    context('supports schemas for objects', function() {
        it("returns 'must be an object' error when property is expected to be an object but it's not", function() {
            const value = 'Sergei Yesenin';
            const schema = {
                name: {
                    $validate: {
                        string: true
                    }
                }
            };

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.an.instanceof(Array);
                expect(errors[0].error).to.equal('object');
                expect(errors[0].message).to.equal('must be an object');
            });
        });

        it("does not return 'must be an object' error when property is undefined", function() {
            const value = undefined;
            const schema = {
                name: {
                    $validate: {
                        string: true
                    }
                }
            };

            const promise = validateProperty(value, schema, {}, {}, []);

            return expect(promise).to.be.fulfilled.then(errors => {
                expect(errors).to.be.undefined;
            });
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
});