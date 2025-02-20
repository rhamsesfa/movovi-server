const multer = require("multer");

try {
  const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/heic": "heic"
  };

  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "images");
    },
    filename: (req, file, callback) => {
      const name = file.originalname.split(" ").join("_");
      const extension = MIME_TYPES[file.mimetype];
      const filename = name + "_" + Date.now() + "." + extension;
      callback(null, filename);
    }
  });

  module.exports = multer({ storage }).array("images", 15);
} catch (e) {
  console.log(e);
}
