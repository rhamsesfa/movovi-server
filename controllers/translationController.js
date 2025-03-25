const Translation = require("../models/translation");
const path = require("path");
const fs = require("fs");

exports.creerTraduction = async (req, res) => {
    try {
        const { french, translations } = req.body;
        const parsedTranslations = JSON.parse(translations);
        const lang = Object.keys(parsedTranslations)[0];
        const translationText = parsedTranslations[lang].toLowerCase(); // Conversion en minuscules ici

        // Vérifier que la traduction est bien une string
        if (typeof translationText !== 'string') {
            return res.status(400).json({ error: "La traduction doit être une chaîne de caractères" });
        }

        // Convertir aussi le français en minuscules pour la cohérence
        const frenchLower = french.toLowerCase();

        // 1. Vérifier si le mot français existe déjà
        const existingTranslation = await Translation.findOne({ french: frenchLower });

        if (existingTranslation) {
            // 2. Vérifier si la traduction existe déjà pour cette langue
            if (existingTranslation.translations.get(lang)) {
                return res.status(409).json({ 
                    message: "Traduction existante",
                    existing: {
                        french: existingTranslation.french,
                        translation: existingTranslation.translations.get(lang),
                        audioUrl: existingTranslation.audioUrls.get(lang)
                    }
                });
            } else {
                // 3. Ajouter la nouvelle traduction à l'entrée existante
                existingTranslation.translations.set(lang, translationText);
                if (req.audioUrl) {
                    existingTranslation.audioUrls.set(lang, req.audioUrl);
                }
                
                await existingTranslation.save();
                return res.status(200).json({
                    message: "Traduction ajoutée à l'entrée existante",
                    translation: existingTranslation
                });
            }
        } else {
            // 4. Créer une nouvelle entrée
            const nouvelleTraduction = new Translation({
                french: frenchLower, // Stockage en minuscules
                translations: { [lang]: translationText }, // Déjà en minuscules
                audioUrls: { [lang]: req.audioUrl }
            });

            await nouvelleTraduction.save();
            return res.status(201).json({
                message: "Nouvelle traduction créée",
                translation: nouvelleTraduction
            });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Erreur lors de la création/mise à jour",
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
// Récupérer les traductions pour un mot en français et une langue spécifique
exports.obtenirTraductionsParLangue = async (req, res) => {
  try {
    const { french, langue } = req.body;

    if (!french || !langue) {
      return res.status(400).json({ error: "Le mot en français et la langue sont requis" });
    }

    // Normaliser en minuscules et supprimer les espaces
    const frenchLower = french.toLowerCase().trim();
    const langueLower = langue.toLowerCase().trim();

    // Recherche insensible à la casse
    const traduction = await Translation.findOne({ 
      french: { $regex: new RegExp(`^${frenchLower}$`, 'i') }
    });

    if (!traduction) {
      return res.status(404).json({ 
        error: `Aucune traduction trouvée pour "${french}"`,
        suggestion: `Essayez avec "${frenchLower}"` 
      });
    }

    // Recherche de la traduction dans la langue spécifiée (insensible à la casse)
    let traductionLangue, audioUrlLangue;
    
    // Parcourir les clés du Map pour trouver une correspondance insensible à la casse
    for (const [key, value] of traduction.translations) {
      if (key.toLowerCase() === langueLower) {
        traductionLangue = value;
        audioUrlLangue = traduction.audioUrls.get(key); // Garde la clé originale
        break;
      }
    }

    if (!traductionLangue) {
      const availableLanguages = Array.from(traduction.translations.keys()).join(', ');
      return res.status(404).json({ 
        error: `Aucune traduction trouvée pour la langue "${langue}"`,
        availableLanguages,
        suggestion: `Langues disponibles: ${availableLanguages}` 
      });
    }

    // Renvoyer les données avec la casse originale stockée
    res.status(200).json({
      french: traduction.french, // Conserve la casse originale du stockage
      translation: traductionLangue,
      audioUrl: audioUrlLangue,
      normalized: {
        french: frenchLower,
        language: langueLower
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      error: "Erreur lors de la récupération",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};