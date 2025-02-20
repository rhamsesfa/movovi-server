const Bouteille = require('../models/bouteille');

// Créer plusieurs bouteilles en fonction du nombre de bouteilles vides et pleines
exports.creerBouteille = async (req, res) => {
    try {
        const { bouteilleVide, bouteillePleine, estConsigne, livraison } = req.body;

        let bouteilles = [];

        // Ajouter les bouteilles vides
        if (bouteilleVide && bouteilleVide > 0) {
            for (let i = 0; i < bouteilleVide; i++) {
                bouteilles.push({
                    type: 'vide',
                    estConsigne: estConsigne || false,
                    livraison: livraison || null,
                    date: new Date()
                });
            }
        }

        // Ajouter les bouteilles pleines
        if (bouteillePleine && bouteillePleine > 0) {
            for (let i = 0; i < bouteillePleine; i++) {
                bouteilles.push({
                    type: 'pleine',
                    estConsigne: estConsigne || false,
                    livraison: livraison || null,
                    date: new Date()
                });
            }
        }

        // Vérifier s'il y a des bouteilles à ajouter
        if (bouteilles.length === 0) {
            return res.status(400).json({ error: 'Aucune bouteille à ajouter' });
        }

        // Insérer toutes les bouteilles en une seule requête
        const bouteillesAjoutees = await Bouteille.insertMany(bouteilles);

        res.status(201).json({
            message: `${bouteillesAjoutees.length} bouteilles ajoutées avec succès`,
            bouteilles: bouteillesAjoutees
        });
    } catch (error) {
        console.error('Erreur lors de la création des bouteilles :', error);
        res.status(500).json({ error: 'Erreur lors de la création des bouteilles' });
    }
};