const multer = require("multer");

try {
  // Définir les types MIME autorisés pour les fichiers audio
  const MIME_TYPES = {
    "audio/mpeg": "mp3",
    "audio/wav": "wav",
    "audio/ogg": "ogg",
    "audio/mp4": "mp4",
    "audio/aac": "aac",
  };

  // Configuration du stockage avec multer
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "audios"); // Dossier où les fichiers audio seront stockés
    },
    filename: (req, file, callback) => {
      // Générer un nom de fichier unique
      const name = file.originalname.split(" ").join("_"); // Remplacer les espaces par des underscores
      const extension = MIME_TYPES[file.mimetype]; // Récupérer l'extension du fichier
      const filename = name + "_" + Date.now() + "." + extension; // Ajouter un timestamp pour éviter les conflits de noms
      callback(null, filename);
    },
  });

  // Exporter la configuration multer pour gérer les fichiers audio
  module.exports = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
      // Vérifier si le type MIME du fichier est autorisé
      if (MIME_TYPES[file.mimetype]) {
        callback(null, true); // Accepter le fichier
      } else {
        callback(new Error("Type de fichier audio non supporté"), false); // Rejeter le fichier
      }
    },
  }).single("audio"); // "audio" est le nom du champ dans le formulaire qui contient le fichier audio
} catch (e) {
  console.log(e);
}