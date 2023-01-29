const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const stockSchema = new Schema({
    name: { type: String, required: true },
    stock: { type: Number, required: true },
    identificador: { type: Number, required: true },
    total: { type: Number, required: false },
    codebar: { type: Number, required: true }
}, {
    timestamps: true
});

const Stock = mongoose.model('stock', stockSchema);

module.exports = Stock;