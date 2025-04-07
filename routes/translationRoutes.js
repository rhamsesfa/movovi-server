const express = require('express');
const router = express.Router();
const translationController = require('../controllers/translationController');
const auth = require("../middleware/auth");
const multerAudio = require("../middleware/multer-audio"); 
//const formatInput = require("../middleware/formatFrenchInput"); 

// Routes pour les traductions
router.post('/', 
    auth,
    multerAudio, // Middleware Multer en premier
    (req, res, next) => {
        // Debug: Vérifiez si le fichier est bien reçu
        console.log("Fichier reçu:", req.file);
        console.log("Corps de la requête:", req.body);
        next();
    },
    translationController.creerTraduction
);
router.get('/', auth, translationController.listerTraductions);
router.get('/:id', auth, translationController.obtenirTraductionParId);
router.put('/:id', auth, translationController.mettreAJourTraduction);
router.delete('/:id', auth, translationController.supprimerTraduction);
router.post('/langue/:langue', translationController.obtenirTraductionsParLangue);
// vote des prononciation
router.post('/vote', auth, translationController.voterPrononciation);

module.exports = router;