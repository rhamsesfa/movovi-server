const express = require('express');
const router = express.Router();
const chauffeurController = require('../controllers/chauffeurController');
const auth = require("../middleware/auth");
const multer2 = require("../middleware/multer-configs2");  

// Route pour créer un chauffeur
router.post('/', auth, multer2, chauffeurController.creerChauffeur);

// Route pour récupérer tous les chauffeurs
router.get('/', auth, chauffeurController.listerChauffeurs);

// Route pour récupérer un chauffeur par ID
router.get('/:id', auth, chauffeurController.obtenirChauffeurParId);

// Route pour mettre à jour un chauffeur par ID
router.put('/:id', auth, chauffeurController.mettreAJourChauffeur);

// Route pour supprimer un chauffeur par ID
router.delete('/:id', auth, chauffeurController.supprimerChauffeur);

module.exports = router;
