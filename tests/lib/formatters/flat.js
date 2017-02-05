'use strict';

const flatFormatter = require('../../../lib/formatters/flat');
const expect        = require('chai').expect;

describe('flat formatter', function() {
    it('transforms nested object with errors to flat structure', function() {
        const nestedErrors = {
            a: {
                b: {
                    c: [
                        {
                            error: 'required'
                        }
                    ]
                }
            }
        };

        const expectedFlatErrors = {
            'a.b.c': [
                { error: 'required' }
            ]
        };

        const result = flatFormatter(nestedErrors);

        expect(result).to.deep.equal(expectedFlatErrors);
    });
});