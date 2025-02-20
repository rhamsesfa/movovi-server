const multer = require("multer");

try {
  const MIME_TYPES = {
    "application/pdf": "pdf", // Ajoutez le type MIME pour les fichiers PDF
  };

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "pdf_documents"); // Définissez le répertoire de destination pour les PDF
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(" ").join("_");

      const extension = MIME_TYPES[file.mimetype];

      const filename = name + Date.now() + "." + extension;
      console.log("Nom du fichier enregistré :", filename);

      callback(null, name + Date.now() + "." + extension);
    },
  });

  module.exports = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
      if (file.mimetype === "application/pdf") {
        callback(null, true);
      } else {
        callback(new Error("Seuls les fichiers PDF sont autorisés."), false);
      }
    },
  }).single("pdf_document"); // Utilisez 'pdf_document' comme champ de formulaire pour les PDF
} catch (err) {
  console.log(err);
}
