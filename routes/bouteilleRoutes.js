const express = require('express');
const router = express.Router();
const bouteilleController = require('../controllers/bouteilleController');
const auth = require("../middleware/auth");

// Route pour créer une bouteille
router.post('/', auth, bouteilleController.creerBouteille);

// Route pour récupérer toutes les bouteilles
router.get('/', auth, bouteilleController.listerBouteilles);

// Route pour récupérer une bouteille par ID
router.get('/:id', auth, bouteilleController.obtenirBouteilleParId);

// Route pour mettre à jour une bouteille par ID
router.put('/:id', auth, bouteilleController.mettreAJourBouteille);

// Route pour supprimer une bouteille par ID
router.delete('/:id', auth, bouteilleController.supprimerBouteille);

module.exports = router;
