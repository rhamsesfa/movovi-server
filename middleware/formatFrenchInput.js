// formatFrenchInput.js - Middleware de formatage
module.exports = (req, res, next) => {
  if (!req.body.french) return next();

  try {
    console.log(req.body.french)
    // 1. Conservation du texte original
    req.body.originalFrench = req.body.french;

    // 2. Formatage intelligent
    req.body.french = req.body.french
      // Supprime les apostrophes en début/fin de mot
      .replace(/(^| )['’]+/g, '$1')  // Début
      .replace(/['’]+( |$)/g, '$1')  // Fin
      // Garde les apostrophes au milieu des mots
      .replace(/(\w)['’](\w)/g, '$1$2')  // Entre lettres
      // Normalisation des espaces
      .replace(/\s+/g, ' ')
      .trim()
      // Conserve la casse originale
      .toLowerCase();

    next();
  } catch (error) {
    console.error('Erreur de formatage:', error);
    next();
  }
};