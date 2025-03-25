const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Chemin absolu vers le dossier audios
const audioDir = path.join(__dirname, '../audios');

// Créer le dossier s'il n'existe pas
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
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
        const lang = req.body.langue || 'unknown';
        const uniqueName = `${lang}_${Date.now()}.${MIME_TYPES[file.mimetype]}`;
        cb(null, uniqueName);
    }
});

module.exports = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (MIME_TYPES[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error("Type de fichier audio non supporté"), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
}).single("audio");