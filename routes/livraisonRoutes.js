const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const auth = require("../middleware/auth");

router.post('/', auth, livraisonController.creerLivraison);
router.get('/', auth, livraisonController.listerLivraisons);
router.get('/:id', auth, livraisonController.obtenirLivraisonParId);
router.put('/:id', auth, livraisonController.mettreAJourLivraison);
router.delete('/:id', auth, livraisonController.supprimerLivraison);

module.exports = router;
