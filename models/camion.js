const mongoose = require('mongoose');

const camionSchema = new mongoose.Schema({
    immatriculation: { type: String, required: true },
    capacite: { type: Number, required: true },
    livraisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' }],
    date: { type: Date }
});

module.exports = mongoose.model('Camion', camionSchema);
