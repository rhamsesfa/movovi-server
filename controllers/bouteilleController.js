const Bouteille = require('../models/bouteille');

// Créer une nouvelle bouteille
// Créer plusieurs bouteilles en fonction du nombre de bouteilles vides et pleines
exports.creerBouteille = async (req, res) => {
    try {
        let { bouteilleVide, bouteillePleine, estConsigne, livraison } = req.body;
        
        console.log(req.body, bouteilleVide)

        // Convertir les valeurs en nombres entiers
        bouteilleVide = parseInt(bouteilleVide, 10) || 0;
        bouteillePleine = parseInt(bouteillePleine, 10) || 0;

        let bouteilles = [];
        console.log(bouteilleVide)

        // Ajouter les bouteilles vides
        if (bouteilleVide > 0) {
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
        if (bouteillePleine > 0) {
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


// Lister toutes les bouteilles
exports.listerBouteilles = async (req, res) => {
    try {
        const bouteilles = await Bouteille.find();
        res.status(200).json(bouteilles);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des bouteilles' });
    }
};

// Récupérer une bouteille par ID
exports.obtenirBouteilleParId = async (req, res) => {
    try {
        const { id } = req.params;
        const bouteille = await Bouteille.findById(id);

        if (!bouteille) {
            return res.status(404).json({ error: 'Bouteille non trouvée' });
        }

        res.status(200).json(bouteille);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la bouteille' });
    }
};

// Mettre à jour une bouteille par ID
exports.mettreAJourBouteille = async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const bouteille = await Bouteille.findByIdAndUpdate(id, miseAJour, {
            new: true,
            runValidators: true,
        });

        if (!bouteille) {
            return res.status(404).json({ error: 'Bouteille non trouvée' });
        }

        res.status(200).json(bouteille);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la bouteille' });
    }
};

// Supprimer une bouteille par ID
exports.supprimerBouteille = async (req, res) => {
    try {
        const { id } = req.params;

        const bouteille = await Bouteille.findByIdAndDelete(id);

        if (!bouteille) {
            return res.status(404).json({ error: 'Bouteille non trouvée' });
        }

        res.status(200).json({ message: 'Bouteille supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la bouteille' });
    }
};
