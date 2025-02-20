const mongoose = require('mongoose');

const camionSchema = new mongoose.Schema({
    photo: { type: String },
    marque: { type: String, required: true },
    immatriculation: { type: String, required: true },
    capacite: { type: Number, required: true },
    livraisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' }],
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Référence à l'utilisateur
});

module.exports = mongoose.model('Camion', camionSchema);
