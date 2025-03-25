const express = require("express"); 
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require('cors');
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/audios', express.static(path.join(__dirname, 'audios')));
app.use('/pdf_documents', express.static(path.join(__dirname, 'pdf_documents')));
app.use("/images", express.static(path.join(__dirname, "images")));

// CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Database connection
mongoose.connect("mongodb+srv://rhamsesfa:appo1993@cluster0.gkhis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
    autoIndex: true 
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((err) => console.log('Connexion à MongoDB échouée!', err));

// Routes
const userRouter = require("./routes/User");
const livraisonRoutes = require('./routes/livraisonRoutes');
const bouteilleRoutes = require('./routes/bouteilleRoutes');
const camionRoutes = require('./routes/camionRoutes');
const chauffeurRoutes = require('./routes/chauffeurRoutes');
const translationRoutes = require('./routes/translationRoutes');

app.use('/api/livraisons', livraisonRoutes);
app.use('/api/bouteilles', bouteilleRoutes);
app.use('/api/camions', camionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);
app.use('/api/translation', translationRoutes);
app.use("/api/user", userRouter);

// Error handling middleware for static files
app.use((err, req, res, next) => {
    if (err && err.status === 404 && req.url.startsWith('/audios/')) {
        console.error('Erreur accès fichier audio:', err);
        return res.status(404).json({ error: 'Fichier audio non trouvé' });
    }
    next(err);
});

module.exports = app;