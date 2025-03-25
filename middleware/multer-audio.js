const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Chemin absolu et création du dossier
const audioDir = path.resolve(__dirname, '../audios');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
    console.log(`Dossier audios créé à: ${audioDir}`);
}

const MIME_TYPES = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/aac": "aac"
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        try {
            // Récupération de la langue depuis le corps de la requête
            const body = JSON.parse(JSON.stringify(req.body));
            const lang = body.langue || Object.keys(JSON.parse(body.translations))[0] || 'unknown';
            
            const originalName = file.originalname.replace(/\s+/g, '_');
            const uniqueName = `${lang}_${Date.now()}_${originalName}`;
            cb(null, uniqueName);
        } catch (err) {
            console.error("Erreur génération nom fichier:", err);
            cb(err);
        }
    }
});

module.exports = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (MIME_TYPES[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error(`Type ${file.mimetype} non supporté`), false);
        }
    }
}).single("audio");