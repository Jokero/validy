const validy = require('validy');

const book = { // object to validate
    name: 'The Adventures of Tom Sawyer',
    author: {
        name: 123456 // 'Mark Twain'
    },
    reviews: [
        {
            // author: 'Leo Tolstoy',
            text: 'Great novel'
        },
        {
            author: 'Fyodor Dostoyevsky',
            text: 'Very interesting'
        }
    ]
};

const schema = {
    name: {
        $validate: {
            required: true,
            string: true
        }
    },
    author: {
        name: {
            $validate: {
                required: true,
                string: true
            }
        }
    },
    reviews: [{ // define schema for array items
        author: {
            $validate: {
                required: true,
                string: true
            }
        },
        text: {
            $validate: {
                required: true,
                string: true
            }
        }
    }]
};

validy(book, schema)
    .then(errors => {
        if (errors) {
            // you have validation errors ("errors" is plain object)
            console.log('Validation errors', errors);
        } else {
            // no errors ("errors" is undefined)
            console.log('Everything is valid');
        }
    })
    .catch(err => {
        // application error (something went wrong)
        console.log('Application error', err);
    });
