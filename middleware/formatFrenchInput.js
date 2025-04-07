const franc = require('franc-min');
const { francToIso } = require('franc-min/iso6393');
const { words: frenchWords } = require('french-words');

module.exports = (req, res, next) => {
  try {
    if (!req.body.french) return next();

    // 1. Nettoyage du texte
    let formatted = req.body.french
      .replace(/[^a-zA-ZÀ-ÿ0-9 '’-]/g, ' ')
      .replace(/(\w)['’](\W|$)/g, '$1 $2') // Supprime apostrophes en fin de mot
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    // 2. Vérification langue
    if (francToIso(franc(formatted)) !== 'fra') {
      return res.status(400).json({ error: "Texte non français" });
    }

    // 3. Validation des mots (sans correction)
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
    res.status(500).json({ error: "Erreur de traitement" });
  }
}