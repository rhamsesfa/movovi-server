// formatFrenchInput.js - Middleware final
module.exports = (req, res, next) => {
  if (!req.body.french) return next();

  try {
    // 1. Conservation du texte original
    req.body.originalFrench = req.body.french;

    // 2. Formatage intelligent
    req.body.french = req.body.french
      // Supprime tous les caractères non autorisés (sauf apostrophes au milieu des mots)
      .replace(/(\w)['’](\w)|['’]|([^a-zA-ZÀ-ÿ0-9\s'])/g, (match, p1, p2) => {
        // Garde uniquement les apostrophes entre lettres (p1 et p2 capturent les lettres autour)
        return p1 && p2 ? `${p1}'${p2}` : '';
      })
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