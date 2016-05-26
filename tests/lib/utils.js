'use strict';

const utils  = require('../../lib/utils');
const expect = require('chai').expect;

describe('utils', function() {
    describe('hasSchemaAtLeastOneProperty', function() {
        it('returns false for schema with service key (with "$" prefix)', function() {
            const schema = {
                $validators: {
                    required: true
                }
            };

            const hasProperty = utils.hasSchemaAtLeastOneProperty(schema);

            expect(hasProperty).to.be.false;
        });

        it('returns true for schema with regular property', function() {
            const schema = {
                a: {
                    $validators: {
                        required: true
                    }
                }
            };

            const hasProperty = utils.hasSchemaAtLeastOneProperty(schema);
            
            expect(hasProperty).to.be.true;
        });
    });
});