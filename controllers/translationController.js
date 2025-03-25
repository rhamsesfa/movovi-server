const Translation = require("../models/translation");
const path = require("path");

exports.creerTraduction = async (req, res) => {
    try {
        const { french, translations } = req.body;
        let audioUrls = {};

        if (req.file) {
            const lang = Object.keys(JSON.parse(translations))[0];
            audioUrls[lang] = `/audios/${req.file.filename}`;
        }

        const nouvelleTraduction = new Translation({
            french,
            translations: JSON.parse(translations),
            audioUrls
        });

        const traduction = await nouvelleTraduction.save();
        
        res.status(201).json({
            ...traduction._doc,
            audioUrl: audioUrls[Object.keys(audioUrls)[0]] || null
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Erreur lors de la création de la traduction",
            details: error.message 
        });
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
// Récupérer les traductions pour un mot en français et une langue spécifique
exports.obtenirTraductionsParLangue = async (req, res) => {
  try {
    const { french, langue } = req.body; // Récupérer le mot en français et la langue depuis le corps de la requête

    if (!french || !langue) {
      return res.status(400).json({ error: "Le mot en français et la langue sont requis" });
    }

    // Rechercher la traduction dans la base de données en fonction du mot en français
    const traduction = await Translation.findOne({ french });
    console.log(traduction)

    if (!traduction) {
      return res.status(404).json({ error: "Traduction non trouvée pour le mot spécifié" });
    }

    // Extraire la traduction et l'URL audio pour la langue spécifiée
    const traductionLangue = traduction.translations.get(langue);
    const audioUrlLangue = traduction.audioUrls.get(langue);

    if (!traductionLangue) {
      return res.status(404).json({ error: `Aucune traduction trouvée pour la langue ${langue}` });
    }

    // Renvoyer la réponse avec les données nécessaires
    res.status(200).json({
      french: traduction.french,
      translation: traductionLangue,
      audioUrl: audioUrlLangue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la récupération des traductions pour la langue spécifiée" });
  }
};