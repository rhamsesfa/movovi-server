const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegPath);

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
            const body = req.body;
            const translations = typeof body.translations === 'string' ? 
                JSON.parse(body.translations) : body.translations;
            const lang = body.langue || (translations ? Object.keys(translations)[0] : 'unknown');
            
            const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_');
            // Nom final directement en .mp3
            const finalName = `${lang}_${Date.now()}_${originalName}.mp3`;
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
    fileFilter: fileFilter
}).single("audio");

module.exports = (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return next(err);
        }

        if (!req.file) {
            return next();
        }

        const filePath = req.file.path;
        const isMP3 = path.extname(filePath).toLowerCase() === '.mp3';

        // Si le fichier n'est pas déjà en MP3, le convertir
        if (!isMP3) {
            try {
                const tempPath = filePath + '.tmp';
                
                await new Promise((resolve, reject) => {
                    ffmpeg(filePath)
                        .audioCodec('libmp3lame')
                        .audioBitrate(128)
                        .format('mp3')
                        .on('end', resolve)
                        .on('error', reject)
                        .save(tempPath);
                });

                // Remplacer le fichier original par la version MP3
                fs.unlinkSync(filePath);
                fs.renameSync(tempPath, filePath);
                
                // Mettre à jour le type MIME
                req.file.mimetype = 'audio/mpeg';

            } catch (convertErr) {
                console.error("Erreur conversion audio:", convertErr);
                // Nettoyer les fichiers en cas d'erreur
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return next(new Error("Échec de la conversion audio"));
            }
        }

        // Préparer l'URL audio pour le contrôleur
        req.audioUrl = `/audios/${req.file.filename}`;
        next();
    });
};