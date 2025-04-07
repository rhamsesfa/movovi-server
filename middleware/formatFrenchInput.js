// formatFrenchInput.js - Middleware ultime
module.exports = (req, res, next) => {
  if (!req.body.french) return next();

  try {
    req.body.originalFrench = req.body.french;

    req.body.french = req.body.french
      // Remplace tous les séparateurs indésirables (tirets, underscores, symboles) par des espaces
      .replace(/[-_&*+=\\|/<>{}[\]~^@#%$£¤§°]/g, ' ')
      // Gère les apostrophes (conserve seulement celles entre lettres)
      .replace(/(\w)['’](\w)|['’]/g, (match, p1, p2) => p1 && p2 ? `${p1}'${p2}` : ' ')
      // Supprime les autres caractères spéciaux
      .replace(/[^a-zA-ZÀ-ÿ0-9\s']/g, ' ')
      // Normalisation finale
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    //console.log(req.body.french)

    next();
  } catch (error) {
    console.error('Erreur de formatage:', error);
    next();
  }
};