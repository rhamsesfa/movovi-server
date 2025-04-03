const Translation = require("../models/translation");
const path = require("path");
const fs = require("fs");

exports.creerTraduction = async (req, res) => {
    try {
        const { french, translations } = req.body;
        const parsedTranslations = JSON.parse(translations);
        const lang = Object.keys(parsedTranslations)[0];
        const translationText = parsedTranslations[lang].toLowerCase();

        if (typeof translationText !== 'string') {
            return res.status(400).json({ error: "La traduction doit être une chaîne de caractères" });
        }

        const frenchLower = french.toLowerCase();
        const existingTranslation = await Translation.findOne({ french: frenchLower });

        if (existingTranslation) {
            // Vérifier si la traduction existe déjà pour cette langue
            if (existingTranslation.translations.get(lang)) {
                // Si un audio est fourni, l'ajouter au tableau existant
                if (req.audioUrl) {
                    const audioRecords = existingTranslation.audioUrls.get(lang) || [];
                    audioRecords.push({
                        user: req.userId, // Supposons que l'ID utilisateur est dans req.userId
                        audio: req.audioUrl
                    });
                    existingTranslation.audioUrls.set(lang, audioRecords);
                    await existingTranslation.save();
                }

                return res.status(409).json({ 
                    message: "Traduction existante",
                    existing: {
                        french: existingTranslation.french,
                        translation: existingTranslation.translations.get(lang),
                        audioUrls: existingTranslation.audioUrls.get(lang)
                    }
                });
            } else {
                // Ajouter la nouvelle traduction à l'entrée existante
                existingTranslation.translations.set(lang, translationText);
                if (req.audioUrl) {
                    existingTranslation.audioUrls.set(lang, [{
                        user: req.userId,
                        audio: req.audioUrl
                    }]);
                }
                
                await existingTranslation.save();
                return res.status(200).json({
                    message: "Traduction ajoutée à l'entrée existante",
                    translation: existingTranslation
                });
            }
        } else {
            // Créer une nouvelle entrée
            const nouvelleTraduction = new Translation({
                french: frenchLower,
                translations: { [lang]: translationText },
                audioUrls: req.audioUrl ? { 
                    [lang]: [{
                        user: req.userId,
                        audio: req.audioUrl
                    }] 
                } : {}
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
exports.obtenirTraductionsParLangue = async (req, res) => {
  try {
    const { french, langue } = req.body;

    if (!french || !langue) {
      return res.status(400).json({ error: "Le mot en français et la langue sont requis" });
    }

    const frenchLower = french.toLowerCase().trim();
    const langueLower = langue.toLowerCase().trim();

    const traduction = await Translation.findOne({ 
      french: { $regex: new RegExp(`^${frenchLower}$`, 'i') }
    });

    if (!traduction) {
      return res.status(404).json({ 
        error: `Aucune traduction trouvée pour "${french}"`,
        suggestion: `Essayez avec "${frenchLower}"` 
      });
    }

    let traductionLangue, audioRecordsLangue;
    
    for (const [key, value] of traduction.translations) {
      if (key.toLowerCase() === langueLower) {
        traductionLangue = value;
        audioRecordsLangue = traduction.audioUrls.get(key); // Récupère tous les enregistrements audio
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

    res.status(200).json({
      french: traduction.french,
      translation: traductionLangue,
      audioRecords: audioRecordsLangue || [], // Retourne un tableau vide si aucun audio
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