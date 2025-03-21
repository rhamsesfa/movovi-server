const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
    french: { type: String, required: true }, // Le mot ou l'expression en français
    translations: {
        type: Map,
        of: String, // Chaque traduction sera une chaîne de caractères
        required: true,
    },
    audioUrls: {
        type: Map,
        of: String, // Les URLs des fichiers audio pour chaque langue
    },
});

module.exports = mongoose.model('Translation', TranslationSchema);