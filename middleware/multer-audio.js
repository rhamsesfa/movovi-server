const multer = require("multer");
const path = require("path");

// Créer le dossier audios s'il n'existe pas
const audioDir = path.join(__dirname, '../audios');
const fs = require('fs');
if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
}

const MIME_TYPES = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/aac": "aac",
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = MIME_TYPES[file.mimetype] || 'audio';
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
    }
});

const fileFilter = (req, file, cb) => {
    if (MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error('Type de fichier audio non supporté'), false);
    }
};

module.exports = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB max
    }
}).single("audio");