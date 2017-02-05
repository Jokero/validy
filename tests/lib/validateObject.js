'use strict';

const validateObject = require('../../lib/validateObject');
const chai           = require('chai');
const expect         = chai.expect;
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

describe('validateObject', function() {
    it("resolves property schema when it's function", function() {
        const schema = {
            name: () => ({
                $validate: {
                    required: true
                }
            })
        };
        const object = {};

        const promise = validateObject(object, schema, object, []);

        return expect(promise).to.be.fulfilled.then(errors => {
            expect(errors.name).to.be.an.instanceof(Array);
            expect(errors.name[0].error).to.equal('required');
        });
    });
});