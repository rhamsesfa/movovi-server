// formatFrenchInput.js - Middleware final
module.exports = (req, res, next) => {
  if (!req.body.french) return next();

  try {
    // 1. Conservation du texte original
    req.body.originalFrench = req.body.french;

    // 2. Formatage intelligent
    req.body.french = req.body.french
      // Supprime les apostrophes en fin de mot
      .replace(/(\w)['’]+(\s|$)/g, '$1$2')  // Fin de mot
      // Supprime les apostrophes en début de mot
      .replace(/(^|\s)['’]+(\w)/g, '$1$2')  // Début de mot
      // Normalisation des espaces
      .replace(/\s+/g, ' ')
      .trim()
      // Conversion en minuscules
      .toLowerCase();

    next();
  } catch (error) {
    console.error('Erreur de formatage:', error);
    next();
  }
};