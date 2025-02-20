const mongoose = require('mongoose');

const chauffeurSchema = new mongoose.Schema({
    photo: { type: String },
    nom: { type: String, required: true },
    date: { type: Date },
    performance: { type: Number, default: 0 },
    livraisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' }],
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Référence à l'utilisateur
});

module.exports = mongoose.model('Chauffeur', chauffeurSchema);