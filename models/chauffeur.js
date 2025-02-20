const mongoose = require('mongoose');

const chauffeurSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    performance: { type: Number, default: 0 },
    livraisons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' }]
});

module.exports = mongoose.model('Chauffeur', chauffeurSchema);