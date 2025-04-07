// formatFrenchInput.js
const franc = require('franc');
const frenchWords = require('french-words').words;

module.exports = (req, res, next) => {
  try {
    if (!req.body.french) return next();

    // 1. Nettoyage du texte
    let formatted = req.body.french
      .replace(/[^a-zA-ZÀ-ÿ0-9 '’-]/g, ' ')
      .replace(/(\w)['’](\W|$)/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // 2. Vérification langue
    const langCode = franc(formatted);
    if (langCode !== 'fra') {
      return res.status(400).json({ 
        error: "Texte non français",
        detectedLanguage: langCode
      });
    }

    // 3. Validation des mots
    const invalidWords = formatted.split(' ').filter(word => 
      word.length > 2 && !frenchWords.includes(word)
    );

    if (invalidWords.length > 0) {
      return res.status(400).json({
        error: "Mots français invalides détectés",
        invalidWords,
        suggestion: "Vérifiez l'orthographe"
      });
    }

    req.body.french = formatted;
    next();
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      error: "Erreur de traitement",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};