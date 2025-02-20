const Livraison = require('../models/livraison');

exports.creerLivraison = async (req, res) => {
    try {
        const nouvelleLivraison = new Livraison(req.body);
        const livraison = await nouvelleLivraison.save();
        res.status(201).json(livraison);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la livraison' });
    }
};

exports.listerLivraisons = async (req, res) => {
    try {
        const livraisons = await Livraison.find()
            .populate('camion')
            .populate('chauffeur')
            .populate('bouteillesDepart')
            .populate('bouteillesRetour');
        res.status(200).json(livraisons);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des livraisons' });
    }
};


// Autres méthodes : obtenirLivraisonParId, mettreAJourLivraison, supprimerLivraison

exports.obtenirLivraisonParId = async (req, res) => {
    try {
        const { id } = req.params;
        const livraison = await Livraison.findById(id)
            .populate('camion')
            .populate('chauffeur')
            .populate('bouteillesDepart')
            .populate('bouteillesRetour');

        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }

        res.status(200).json(livraison);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération de la livraison' });
    }
};

exports.supprimerLivraison = async (req, res) => {
    try {
        const { id } = req.params;

        const livraison = await Livraison.findByIdAndDelete(id);

        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }

        res.status(200).json({ message: 'Livraison supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la livraison' });
    }
};

exports.mettreAJourLivraison = async (req, res) => {
    try {
        const { id } = req.params; // Récupération de l'ID depuis les paramètres
        const miseAJour = req.body; // Données de mise à jour

        // Mise à jour de la livraison avec validation et retour du document mis à jour
        const livraison = await Livraison.findByIdAndUpdate(id, miseAJour, {
            new: true, // Retourne le document mis à jour
            runValidators: true, // Applique les validations définies dans le schéma
        });

        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }

        res.status(200).json({
            message: 'Livraison mise à jour avec succès',
            livraison,
        });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la livraison' });
    }
};


