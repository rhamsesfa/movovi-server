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
    },
    likes: {
        type: [String], // Stocke les IDs des utilisateurs qui ont liké
        default: []
    },
    dislikes: {
        type: [String], // Stocke les IDs des utilisateurs qui ont disliké
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const TranslationSchema = new mongoose.Schema({
    french: { 
        type: String, 
        required: true 
    },
    translations: {
        type: Map,
        of: String,
        required: true,
    },
    audioUrls: {
        type: Map,
        of: [AudioRecordSchema],
        default: {}
    },
});

module.exports = mongoose.model('Translation', TranslationSchema);