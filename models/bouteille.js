const mongoose = require('mongoose');

const bouteilleSchema = new mongoose.Schema({
    type: { type: String, enum: ['pleine', 'vide'], required: true },
    estConsigne: { type: Boolean, default: false },
    livraison: { type: mongoose.Schema.Types.ObjectId, ref: 'Livraison' }
});

module.exports = mongoose.model('Bouteille', bouteilleSchema);