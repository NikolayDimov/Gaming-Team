const { Schema, model, Types: { ObjectId } } = require('mongoose');

const URL_PATTERN = /^https?:\/\/(.+)/;


// TODO add validation
const gameSchema = new Schema({
    name: { type: String, required: [true, 'Name is required'], minlength: [4, 'Name must be at least 4 characters long'] },
    image: {
        type: String, required: true, validate: {
            validator(value) {
                return URL_PATTERN.test(value);
            },
            message: 'Image must be a valid URL'
        }
    },
    price: { type: Number, required: true, min: 0, default: 0},
    description: { type: String, required: [true, 'Description is required'], minlength: [10, 'Description must be at least 10 characters long']},
    genre: { type: String, required: [true, 'Genre is required'], minlength: [2, 'Genre must be at least 2 characters long'] },
    platform: {
        type: String, required: true,
        enum: {
            values: ['PC', 'Nintendo', 'PS4', 'PS5', 'XBOX'],
            message: 'Invalid platform method'
        },
    },
    boughtBy: { type: [ObjectId], ref: 'User' },
    owner: { type: ObjectId, ref: 'User', required: true }
});


const GameModel = model('Game', gameSchema);

module.exports = GameModel;