const mongoose = require('mongoose');

const bouteilleSchema = new mongoose.Schema({
    type: { type: String, enum: ['pleine', 'vide'], required: true },
    estConsigne: { type: Boolean, default: false },
    livraison: { type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' },
    date: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Référence à l'utilisateur
});

module.exports = mongoose.model('Bouteille', bouteilleSchema);