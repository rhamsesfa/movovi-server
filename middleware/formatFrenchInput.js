async function checkFrenchText(text) {
  // Import dynamique des modules ESM
  const { default: franc } = await import('franc-min');
  const { francToIso } = await import('franc-min/iso6393');
  const { words: frenchWords } = await import('french-words');

  // 1. Nettoyage du texte
  let formatted = text
    .replace(/[^a-zA-ZÀ-ÿ0-9 '’-]/g, ' ')
    .replace(/(\w)['’](\W|$)/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

  // 2. Vérification langue
  if (francToIso(franc(formatted)) !== 'fra') {
    return { error: "Texte non français" };
  }

  // 3. Validation des mots
  const invalidWords = formatted.split(' ').filter(word => 
    word.length > 2 && !frenchWords.includes(word)
  );

  if (invalidWords.length > 0) {
    return { 
      error: "Mots français invalides détectés",
      invalidWords,
      suggestion: "Vérifiez l'orthographe"
    };
  }

  return { formatted };
}

module.exports = (req, res, next) => {
  if (!req.body.french) return next();

  checkFrenchText(req.body.french)
    .then(result => {
      if (result.error) {
        return res.status(400).json(result);
      }
      req.body.french = result.formatted;
      next();
    })
    .catch(error => {
      console.error('Erreur:', error);
      res.status(500).json({ error: "Erreur de traitement" });
    });
};