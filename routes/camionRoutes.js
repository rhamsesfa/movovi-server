const express = require('express');
const router = express.Router();
const camionController = require('../controllers/camionController');
const auth = require("../middleware/auth");
const multer2 = require("../middleware/multer-configs2");  

// Route pour créer un camion
router.post('/', auth, multer2, camionController.creerCamion);

// Route pour récupérer tous les camions
router.get('/', auth, camionController.listerCamions);

// Route pour récupérer un camion par ID
router.get('/:id', auth, camionController.obtenirCamionParId);

// Route pour mettre à jour un camion par ID
router.put('/:id', auth, camionController.mettreAJourCamion);

// Route pour supprimer un camion par ID
router.delete('/:id', auth, camionController.supprimerCamion);

module.exports = router;
