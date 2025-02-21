const mongoose = require('mongoose');

const livraisonSchema = new mongoose.Schema({
    camion: { type: mongoose.Schema.Types.ObjectId, ref: 'Camion', required: true },
    chauffeur: { type: mongoose.Schema.Types.ObjectId, ref: 'Chauffeur', required: true },
    bouteillesDepart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bouteille' }],
    bouteillesRetour: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bouteille' }],
    bouteillesConsignes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bouteille' }],
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Livraison', livraisonSchema);