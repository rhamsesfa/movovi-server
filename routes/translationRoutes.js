const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const auth = require("../middleware/auth");
const multerAudio = require("../middleware/multer-audio"); 

// Routes pour les traductions
router.post('/', multerAudio, translationController.creerTraduction);
router.get('/', auth, translationController.listerTraductions);
router.get('/:id', auth, translationController.obtenirTraductionParId);
router.put('/:id', auth, translationController.mettreAJourTraduction);
router.delete('/:id', auth, translationController.supprimerTraduction);
router.post('/langue/:langue', translationController.obtenirTraductionsParLangue);

module.exports = router;