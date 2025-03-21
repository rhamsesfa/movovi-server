const Translation = require("../models/translation");

// Créer une nouvelle traduction
exports.creerTraduction = async (req, res) => {
  try {
    const { french, translations, audioUrls } = req.body;

    const nouvelleTraduction = new Translation({
      french,
      translations,
      audioUrls,
    });

    const traduction = await nouvelleTraduction.save();
    res.status(201).json(traduction);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la création de la traduction" });
  }
};

// Lister toutes les traductions
exports.listerTraductions = async (req, res) => {
  try {
    const traductions = await Translation.find();
    res.status(200).json(traductions);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des traductions" });
  }
};

// Récupérer une traduction par ID
exports.obtenirTraductionParId = async (req, res) => {
  try {
    const { id } = req.params;
    const traduction = await Translation.findById(id);

    if (!traduction) {
      return res.status(404).json({ error: "Traduction non trouvée" });
    }

    res.status(200).json(traduction);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération de la traduction" });
  }
};

// Mettre à jour une traduction par ID
exports.mettreAJourTraduction = async (req, res) => {
  try {
    const { id } = req.params;
    const miseAJour = req.body;

    const traduction = await Translation.findByIdAndUpdate(id, miseAJour, {
      new: true,
      runValidators: true,
    });

    if (!traduction) {
      return res.status(404).json({ error: "Traduction non trouvée" });
    }

    res.status(200).json(traduction);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la mise à jour de la traduction" });
  }
};

// Supprimer une traduction par ID
exports.supprimerTraduction = async (req, res) => {
  try {
    const { id } = req.params;

    const traduction = await Translation.findByIdAndDelete(id);

    if (!traduction) {
      return res.status(404).json({ error: "Traduction non trouvée" });
    }

    res.status(200).json({ message: "Traduction supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la suppression de la traduction" });
  }
};
// Récupérer les traductions pour une langue spécifique
exports.obtenirTraductionsParLangue = async (req, res) => {
  try {
    const { langue } = req.body;
    const traductions = await Translation.find({}, { french: 1, [`translations.${langue}`]: 1, [`audioUrls.${langue}`]: 1 });

    res.status(200).json(traductions);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des traductions pour la langue spécifiée" });
  }
};