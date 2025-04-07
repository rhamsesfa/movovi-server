const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

// Configuration initiale
const audioDir = path.resolve(__dirname, '../audios');
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

// Fonction de nettoyage des noms de fichiers
const sanitizeFilename = (filename) => {
    return filename
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-zA-Z0-9_-]/g, '_') // Remplace les caractères spéciaux par _
        .replace(/_+/g, '_') // Supprime les _ multiples
        .replace(/^_+|_+$/g, '') // Supprime les _ en début/fin
        .toLowerCase();
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, audioDir);
    },
    filename: (req, file, cb) => {
        try {
            // Récupération de la langue
            const lang = req.body.langue || 'unk';
            const cleanLang = sanitizeFilename(lang).substring(0, 3);
            
            // Nettoyage du nom original
            const originalName = sanitizeFilename(path.parse(file.originalname).name);
            
            // Nom final standardisé
            const finalName = `${cleanLang}_${Date.now()}_${originalName}.mp3`;
            cb(null, finalName);
        } catch (err) {
            console.error("Erreur génération nom fichier:", err);
            cb(err);
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (MIME_TYPES[file.mimetype]) {
        cb(null, true);
    } else {
        cb(new Error(`Type ${file.mimetype} non supporté`), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
}).single("audio");

module.exports = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return next(err);
        }

        if (!req.file) {
            return next();
        }

        try {
            const filePath = req.file.path;
            
            // Conversion systématique en MP3
            if (path.extname(filePath).toLowerCase() !== '.mp3') {
                const tempPath = filePath + '.mp3';
                
                await new Promise((resolve, reject) => {
                    ffmpeg(filePath)
                        .audioCodec('libmp3lame')
                        .audioBitrate(128)
                        .format('mp3')
                        .on('end', () => {
                            fs.unlinkSync(filePath);
                            fs.renameSync(tempPath, filePath);
                            resolve();
                        })
                        .on('error', reject)
                        .save(tempPath);
                });
            }

            req.audioUrl = `https://gaz-owendo.glitch.me/audios/${req.file.filename}`;
            next();
        } catch (convertErr) {
            console.error("Erreur traitement audio:", convertErr);
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            next(new Error("Échec du traitement audio"));
        }
    });
};