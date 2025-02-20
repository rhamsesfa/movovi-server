const express = require("express"); 
const mongoose = require("mongoose");

const fs = require("fs");
const cors = require('cors');
const path = require("path");

const app = express();
app.use(cors());

app.use(express.json({limit: "50mb"})); 
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

    next();
});

mongoose.connect("mongodb+srv://rhamsesfa:Appo1993ixyz@rhamses.ukq4q.mongodb.net/gaz?retryWrites=true&w=majority&appName=rhamses",
  { useNewUrlParser: true,
    useUnifiedTopology: true, autoIndex: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch((err) => console.log('Connexion à MongoDB échouée !', err)
);



const userRouter = require("./routes/User");
const livraisonRoutes = require('./routes/livraisonRoutes');
const bouteilleRoutes = require('./routes/bouteilleRoutes');
const camionRoutes = require('./routes/camionRoutes');
const chauffeurRoutes = require('./routes/chauffeurRoutes');

// Routes
app.use('/api/livraisons', livraisonRoutes);
app.use('/api/bouteilles', bouteilleRoutes);
app.use('/api/camions', camionRoutes);
app.use('/api/chauffeurs', chauffeurRoutes);


app.use("/api/user", userRouter);
app.use('/pdf_documents', express.static(path.join(__dirname, 'pdf_documents')));
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;