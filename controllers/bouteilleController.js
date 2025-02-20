const Bouteille = require('../models/bouteille');

// Créer une nouvelle bouteille
exports.creerBouteille = async (req, res) => {
    try {
        const nouvelleBouteille = new Bouteille(req.body);
        const bouteille = await nouvelleBouteille.save();
        res.status(201).json(bouteille);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la bouteille' });
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
