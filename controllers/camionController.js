const Camion = require("../models/camion");

// Créer un nouveau camion
// Créer un nouveau camion
exports.creerCamion = async (req, res) => {
  try {
    

    const userId = req.auth.userId; // ID de l'utilisateur qui ajoute
    const capacite = parseInt(req.body.capacite, 10) || 0; // Conversion de la capacité en nombre

    const nouveauCamion = new Camion({
      marque: req.body.marque,
      immatriculation: req.body.immatriculation,
      capacite: capacite, 
      userId : userId
    });

    const camion = await nouveauCamion.save();
    res.status(201).json(camion);
  } catch (error) {
    //console.error(error); // Log l'erreur pour le débogage
    res.status(500).json({ error: "Erreur lors de la création du camion" });
  }
};

// Lister tous les camions
exports.listerCamions = async (req, res) => {
  try {
    const camions = await Camion.find();
    res.status(200).json(camions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des camions" });
  }
};

// Récupérer un camion par ID
exports.obtenirCamionParId = async (req, res) => {
  try {
    const { id } = req.params;
    const camion = await Camion.findById(id);

    if (!camion) {
      return res.status(404).json({ error: "Camion non trouvé" });
    }

    res.status(200).json(camion);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération du camion" });
  }
};

// Mettre à jour un camion par ID
exports.mettreAJourCamion = async (req, res) => {
  try {
    const { id } = req.params;
    const miseAJour = req.body;

    const camion = await Camion.findByIdAndUpdate(id, miseAJour, {
      new: true,
      runValidators: true,
    });

    if (!camion) {
      return res.status(404).json({ error: "Camion non trouvé" });
    }

    res.status(200).json(camion);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour du camion" });
  }
};

// Supprimer un camion par ID
exports.supprimerCamion = async (req, res) => {
  try {
    const { id } = req.params;

    const camion = await Camion.findByIdAndDelete(id);

    if (!camion) {
      return res.status(404).json({ error: "Camion non trouvé" });
    }

    res.status(200).json({ message: "Camion supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression du camion" });
  }
};

