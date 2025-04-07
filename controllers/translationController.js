const Translation = require("../models/translation");
const path = require("path");
const fs = require("fs");

exports.creerTraduction = async (req, res) => {
  try {
    const { french, translations } = req.body;
    const parsedTranslations = JSON.parse(translations);
    const lang = Object.keys(parsedTranslations)[0];
    const translationText = parsedTranslations[lang].toLowerCase();

    if (typeof translationText !== "string") {
      return res
        .status(400)
        .json({ error: "La traduction doit être une chaîne de caractères" });
    }

    const frenchLower = french.toLowerCase();
    const existingTranslation = await Translation.findOne({
      french: frenchLower,
    });

    if (existingTranslation) {
      // Vérifier si la traduction existe déjà pour cette langue
      if (existingTranslation.translations.get(lang)) {
        // Si un audio est fourni, l'ajouter au tableau existant
        if (req.audioUrl) {
          const audioRecords = existingTranslation.audioUrls.get(lang) || [];
          audioRecords.push({
            user: req.auth.userId, // Utilisation de req.auth.userId
            audio: req.audioUrl,
          });
          existingTranslation.audioUrls.set(lang, audioRecords);
          await existingTranslation.save();
        }

        return res.status(409).json({
          message: "Traduction existante",
          existing: {
            french: existingTranslation.french,
            translation: existingTranslation.translations.get(lang),
            audioUrls: existingTranslation.audioUrls.get(lang),
          },
        });
      } else {
        // Ajouter la nouvelle traduction à l'entrée existante
        existingTranslation.translations.set(lang, translationText);
        if (req.audioUrl) {
          existingTranslation.audioUrls.set(lang, [
            {
              user: req.auth.userId, // Utilisation de req.auth.userId
              audio: req.audioUrl,
            },
          ]);
        }

        await existingTranslation.save();
        return res.status(200).json({
          message: "Traduction ajoutée à l'entrée existante",
          translation: existingTranslation,
        });
      }
    } else {
      // Créer une nouvelle entrée
      const nouvelleTraduction = new Translation({
        french: frenchLower,
        translations: { [lang]: translationText },
        audioUrls: req.audioUrl
          ? {
              [lang]: [
                {
                  user: req.auth.userId, // Utilisation de req.auth.userId
                  audio: req.audioUrl,
                },
              ],
            }
          : {},
      });

      await nouvelleTraduction.save();
      return res.status(201).json({
        message: "Nouvelle traduction créée",
        translation: nouvelleTraduction,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la création/mise à jour",
      details: error.message,
    });
  }
};

// [Les autres fonctions restent identiques, seul creerTraduction a été modifié pour req.auth.userId]
// Lister toutes les traductions
exports.listerTraductions = async (req, res) => {
  try {
    const traductions = await Translation.find();
    res.status(200).json(traductions);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des traductions" });
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
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de la traduction" });
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
    res
      .status(500)
      .json({ error: "Erreur lors de la mise à jour de la traduction" });
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
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de la traduction" });
  }
};

// Récupérer les traductions pour un mot en français et une langue spécifique
exports.obtenirTraductionsParLangue = async (req, res) => {
  try {
    const { french, langue } = req.body;

    if (!french || !langue) {
      return res
        .status(400)
        .json({ error: "Le mot en français et la langue sont requis" });
    }

    const frenchLower = french.toLowerCase().trim();
    const langueLower = langue.toLowerCase().trim();
    
    console.log(frenchLower)

    const traduction = await Translation.findOne({
      french: { $regex: new RegExp(`^${frenchLower}$`, "i") },
    });

    if (!traduction) {
      return res.status(404).json({
        error: `Aucune traduction trouvée pour "${french}"`,
        suggestion: `Essayez avec "${frenchLower}"`,
      });
    }

    let traductionLangue, audioRecordsLangue;

    for (const [key, value] of traduction.translations) {
      if (key.toLowerCase() === langueLower) {
        traductionLangue = value;
        audioRecordsLangue = traduction.audioUrls.get(key);
        break;
      }
    }

    if (!traductionLangue) {
      const availableLanguages = Array.from(
        traduction.translations.keys()
      ).join(", ");
      return res.status(404).json({
        error: `Aucune traduction trouvée pour la langue "${langue}"`,
        availableLanguages,
        suggestion: `Langues disponibles: ${availableLanguages}`,
      });
    }

    if (audioRecordsLangue) {
            audioRecordsLangue.sort((a, b) => {
                const likesDiff = (b.likes?.length || 0) - (a.likes?.length || 0);
                if (likesDiff !== 0) return likesDiff;
                return new Date(a.createdAt) - new Date(b.createdAt);
            });
        }

    res.status(200).json({
      _id : traduction._id,
      french: traduction.french,
      translation: traductionLangue,
      audioRecords: audioRecordsLangue || [],
      normalized: {
        french: frenchLower,
        language: langueLower,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Ajoutez cette fonction dans translationController.js
exports.voterPrononciation = async (req, res) => {
    try {
        const { translationId, langue, audioId, voteType } = req.body;
        const userId = req.auth.userId;

        const traduction = await Translation.findById(translationId);
        if (!traduction) {
            return res.status(404).json({ error: "Traduction non trouvée" });
        }

        const prononciations = traduction.audioUrls.get(langue);
        if (!prononciations) {
            return res.status(404).json({ error: "Prononciations non trouvées" });
        }

        const prononciation = prononciations.find(p => p._id.toString() === audioId);
        if (!prononciation) {
            return res.status(404).json({ error: "Prononciation non trouvée" });
        }

        // Retirer le vote existant de l'utilisateur
        prononciation.likes = prononciation.likes.filter(id => id !== userId);
        prononciation.dislikes = prononciation.dislikes.filter(id => id !== userId);

        // Ajouter le nouveau vote
        if (voteType === 'like') {
            prononciation.likes.push(userId);
        } else if (voteType === 'dislike') {
            prononciation.dislikes.push(userId);
        }

        // Trier les prononciations par nombre de likes (du plus haut au plus bas)
        prononciations.sort((a, b) => b.likes.length - a.likes.length);
        traduction.audioUrls.set(langue, prononciations);

        await traduction.save();

        // Émettre l'événement de mise à jour
        req.app.get('io').emit('voteUpdate', {
            translationId,
            langue,
            audioId,
            likes: prononciation.likes.length,
            dislikes: prononciation.dislikes.length
        });

        res.status(200).json({
            message: "Vote enregistré",
            likes: prononciation.likes.length,
            dislikes: prononciation.dislikes.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            error: "Erreur lors de l'enregistrement du vote",
            details: error.message 
        });
    }
};
