const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const auth = require("../middleware/auth");

// Route pour créer une livraison partielle (aller)
router.post('/aller', auth, livraisonController.creerLivraisonAller);

// Route pour compléter une livraison (retour)
router.put('/retour/:id', auth, livraisonController.completerLivraisonRetour);
//router.get('/', auth, livraisonController.listerLivraisons);
//router.get('/:id', auth, livraisonController.obtenirLivraisonParId);
//router.put('/:id', auth, livraisonController.mettreAJourLivraison);
//router.delete('/:id', auth, livraisonController.supprimerLivraison);

module.exports = router;
