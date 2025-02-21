const Livraison = require("../models/livraison");
const Camion = require("../models/camion");
const Chauffeur = require("../models/chauffeur");
const Bouteille = require("../models/bouteille");

// Première étape : Enregistrer l'aller (bouteilles pleines au départ)
exports.creerLivraisonAller = async (req, res) => {
  try {
    const { nbBouteilleDepart, camionId, chauffeurId } = req.body;

    // Vérifiez que les champs obligatoires sont présents
    if (!nbBouteilleDepart || !camionId || !chauffeurId) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // Récupérez le camion et le chauffeur
    const camion = await Camion.findById(camionId);
    if (!camion) {
      return res.status(404).json({ error: "Camion non trouvé" });
    }

    const chauffeur = await Chauffeur.findById(chauffeurId);
    if (!chauffeur) {
      return res.status(404).json({ error: "Chauffeur non trouvé" });
    }

    // Récupérez les bouteilles pleines disponibles (non livrées ou revenues pleines)
    const bouteillesPleinesDisponibles = await Bouteille.find({
      type: "pleine",
      $or: [
        { livraison: { $exists: false } }, // Bouteilles non encore livrées
        { livraison: { $in: await Livraison.find({ date: { $gte: new Date().setHours(0, 0, 0, 0) } }).distinct("_id") } }, // Bouteilles revenues pleines
      ],
    }).limit(nbBouteilleDepart);

    if (bouteillesPleinesDisponibles.length < nbBouteilleDepart) {
      return res.status(400).json({ error: "Pas assez de bouteilles pleines disponibles" });
    }

    // Créez la livraison partielle (aller)
    const nouvelleLivraison = new Livraison({
      camion: camionId,
      chauffeur: chauffeurId,
      bouteillesDepart: bouteillesPleinesDisponibles.map(b => b._id),
      date: new Date(), // Date de l'aller
    });

    // Sauvegardez la livraison en base de données
    const livraison = await nouvelleLivraison.save();

    // Mettez à jour les bouteilles avec l'ID de la livraison
    await Bouteille.updateMany(
      { _id: { $in: bouteillesPleinesDisponibles.map(b => b._id) } },
      { livraison: livraison._id }
    );

    res.status(201).json(livraison);
  } catch (error) {
    console.error(error); // Log l'erreur pour le débogage
    res.status(500).json({ error: "Erreur lors de la création de la livraison (aller)" });
  }
};

// Deuxième étape : Compléter la livraison avec le retour
exports.completerLivraisonRetour = async (req, res) => {
  try {
    const { livraisonId, nbBouteilleVide, nbBouteillePleine } = req.body;

    // Vérifiez que les champs obligatoires sont présents
    if (!livraisonId || !nbBouteilleVide || !nbBouteillePleine) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires" });
    }

    // Récupérez la livraison partielle (aller)
    const livraison = await Livraison.findById(livraisonId).populate("bouteillesDepart");
    if (!livraison) {
      return res.status(404).json({ error: "Livraison non trouvée" });
    }

    // Vérifiez que la livraison n'a pas déjà été complétée
    if (livraison.bouteillesRetour.length > 0 || livraison.bouteillesConsignes.length > 0) {
      return res.status(400).json({ error: "La livraison a déjà été complétée" });
    }

    // Vérifiez que le nombre de bouteilles vides et pleines est cohérent
    const totalBouteillesRetour = nbBouteilleVide + nbBouteillePleine;
    if (totalBouteillesRetour > livraison.bouteillesDepart.length) {
      return res.status(400).json({ error: "Nombre de bouteilles invalide" });
    }

    // Mettez à jour les bouteilles vides (changer leur type de "pleine" à "vide")
    const bouteillesVides = livraison.bouteillesDepart.slice(0, nbBouteilleVide);
    await Bouteille.updateMany(
      { _id: { $in: bouteillesVides } },
      { type: "vide" }
    );

    // Les bouteilles pleines au retour sont les bouteilles restantes
    const bouteillesPleinesRetour = livraison.bouteillesDepart.slice(nbBouteilleVide, nbBouteilleVide + nbBouteillePleine);

    // Calculez le nombre de bouteilles en consigne
    const nbBouteillesConsignes = livraison.bouteillesDepart.length - (nbBouteilleVide + nbBouteillePleine);
    const bouteillesConsignes = livraison.bouteillesDepart.slice(-nbBouteillesConsignes);

    // Marquez les bouteilles en consigne
    await Bouteille.updateMany(
      { _id: { $in: bouteillesConsignes } },
      { estConsigne: true }
    );

    // Mettez à jour la livraison avec les informations du retour
    livraison.bouteillesRetour = bouteillesVides.map(b => b._id);
    livraison.bouteillesConsignes = bouteillesConsignes.map(b => b._id);
    await livraison.save();

    res.status(200).json(livraison);
  } catch (error) {
    console.error(error); // Log l'erreur pour le débogage
    res.status(500).json({ error: "Erreur lors de la complétion de la livraison (retour)" });
  }
};