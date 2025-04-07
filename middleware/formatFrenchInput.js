async function formatFrenchInput(req, res, next) {
  try {
    // Import dynamique corrigé
    const { default: franc } = await import('franc-min');
    // Plus besoin d'importer francToIso séparément
    const { words: frenchWords } = await import('french-words');

    if (!req.body.french) return next();

    // 1. Nettoyage du texte
    let formatted = req.body.french
      .replace(/[^a-zA-ZÀ-ÿ0-9 '’-]/g, ' ')
      .replace(/(\w)['’](\W|$)/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // 2. Vérification langue (méthode alternative)
    const langCode = franc(formatted);
    if (langCode !== 'fra') { // 'fra' est le code pour le français dans franc-min
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
    console.error('Erreur dans formatFrenchInput:', error);
    res.status(500).json({ 
      error: "Erreur de traitement",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = formatFrenchInput;