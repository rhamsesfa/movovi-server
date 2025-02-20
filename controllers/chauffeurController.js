const Chauffeur = require('../models/chauffeur');

// Créer un nouveau chauffeur
exports.creerChauffeur = async (req, res) => {
  console.log(req.body)
    try {
        const nouveauChauffeur = new Chauffeur(req.body);
        const chauff = {...nouveauChauffeur, date: new Date()}
        const chauffeur = await chauff.save();
        res.status(201).json(chauffeur);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création du chauffeur' });
    }
};

// Lister tous les chauffeurs
exports.listerChauffeurs = async (req, res) => {
    try {
        const chauffeurs = await Chauffeur.find();
        res.status(200).json(chauffeurs);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des chauffeurs' });
    }
};

// Récupérer un chauffeur par ID
exports.obtenirChauffeurParId = async (req, res) => {
    try {
        const { id } = req.params;
        const chauffeur = await Chauffeur.findById(id);

        if (!chauffeur) {
            return res.status(404).json({ error: 'Chauffeur non trouvé' });
        }

        res.status(200).json(chauffeur);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération du chauffeur' });
    }
};

// Mettre à jour un chauffeur par ID
exports.mettreAJourChauffeur = async (req, res) => {
    try {
        const { id } = req.params;
        const miseAJour = req.body;

        const chauffeur = await Chauffeur.findByIdAndUpdate(id, miseAJour, {
            new: true,
            runValidators: true,
        });

        if (!chauffeur) {
            return res.status(404).json({ error: 'Chauffeur non trouvé' });
        }

        res.status(200).json(chauffeur);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du chauffeur' });
    }
};

// Supprimer un chauffeur par ID
exports.supprimerChauffeur = async (req, res) => {
    try {
        const { id } = req.params;

        const chauffeur = await Chauffeur.findByIdAndDelete(id);

        if (!chauffeur) {
            return res.status(404).json({ error: 'Chauffeur non trouvé' });
        }

        res.status(200).json({ message: 'Chauffeur supprimé avec succès' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression du chauffeur' });
    }
};
