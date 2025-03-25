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
            const body = JSON.parse(JSON.stringify(req.body));
            const lang = body.langue || Object.keys(JSON.parse(body.translations))[0] || 'unknown';
            
            const originalName = path.parse(file.originalname).name.replace(/\s+/g, '_');
            // Stocker temporairement avec l'extension originale
            const tempName = `temp_${Date.now()}_${originalName}${path.extname(file.originalname)}`;
            cb(null, tempName);
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
    upload(req, res, (err) => {
        if (err) {
            return next(err);
        }

        if (!req.file) {
            return next();
        }

        const originalPath = req.file.path;
        const originalExt = path.extname(originalPath);
        const finalName = req.file.filename.replace('temp_', '').replace(originalExt, '.mp3');
        const outputPath = path.join(path.dirname(originalPath), finalName);

        // Si le fichier est déjà en MP3, pas besoin de conversion
        if (originalExt.toLowerCase() === '.mp3') {
            // Renommer simplement le fichier (supprimer le préfixe temp_)
            fs.rename(originalPath, outputPath, (renameErr) => {
                if (renameErr) return next(renameErr);
                
                req.file.path = outputPath;
                req.file.filename = finalName;
                next();
            });
            return;
        }

        // Conversion en MP3
        ffmpeg(originalPath)
            .audioCodec('libmp3lame')
            .audioBitrate(128)
            .format('mp3')
            .on('end', () => {
                // Supprimer le fichier original
                fs.unlink(originalPath, (unlinkErr) => {
                    if (unlinkErr) console.error("Erreur suppression fichier original:", unlinkErr);
                    
                    // Mettre à jour les infos du fichier
                    req.file.path = outputPath;
                    req.file.mimetype = 'audio/mpeg';
                    req.file.filename = finalName;
                    
                    next();
                });
            })
            .on('error', (convertErr) => {
                console.error("Erreur conversion audio:", convertErr);
                // Supprimer le fichier original en cas d'erreur
                fs.unlink(originalPath, () => {
                    next(new Error("Échec de la conversion audio"));
                });
            })
            .save(outputPath);
    });
};