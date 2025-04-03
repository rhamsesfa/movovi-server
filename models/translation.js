const mongoose = require('mongoose');

// Sous-schéma pour les enregistrements audio
const AudioRecordSchema = new mongoose.Schema({
    user: { 
        type: String, 
        required: true 
    },
    audio: { 
        type: String, 
        required: true 
    }
});

const TranslationSchema = new mongoose.Schema({
    french: { 
        type: String, 
        required: true 
    }, // Le mot ou l'expression en français
    translations: {
        type: Map,
        of: String, // Chaque traduction sera une chaîne de caractères
        required: true,
    },
    audioUrls: {
        type: Map,
        of: [AudioRecordSchema], // Un tableau d'objets audio pour chaque langue
        default: {} // Valeur par défaut un objet vide
    },
});

module.exports = mongoose.model('Translation', TranslationSchema);