// server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // importez sequelize ici
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const Operation = require('./models/Operation'); 
const Soa = require('./models/Soa'); 
const SuiviBail = require('./models/SuiviBail');
const fs = require('fs'); 

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Configuration de multer pour stocker les fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Assurez-vous que ce dossier existe
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Filtrer les fichiers PDF et images (JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error('Seuls les fichiers PDF, JPEG et PNG sont autorisés'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

// Route pour enregistrer les opérations d'un SOA avec possibilité de télécharger un PDF si devis est coché
app.post('/api/operations', upload.single('devis_pdf'), async (req, res) => {
  const {
    soa_id,
    annee,
    recensement,
    attribution,
    retrait,
    bail,
    devis,
    quitus,
    etatdeslieux
  } = req.body;
  console.log("Contenu de req.body : ", req.body);

  if (!soa_id || !annee) {
    return res.status(400).json({ error: 'soa_id et annee sont requis' });
  }

  try {
    // Convertir les champs booléens en valeurs numériques 1 ou 0
    const operationData = {
      soa_id,
      annee,
      recensement: recensement === 'true' ? 1 : 0,
      attribution: attribution === 'true' ? 1 : 0,
      retrait: retrait === 'true' ? 1 : 0,
      bail: bail === 'true' ? 1 : 0,
      devis: devis === 'true' ? 1 : 0,
      quitus: quitus === 'true' ? 1 : 0,
      etatdeslieux: etatdeslieux === 'true' ? 1 : 0,
      devis_pdf: devis && req.file ? req.file.filename : null
    };

    // Créer l'enregistrement de l'opération
    const operation = await Operation.create(operationData);

    emitDataUpdate();
    res.status(201).json({
      message: 'Opérations enregistrées avec succès',
      operation,
      devis_pdf: operationData.devis_pdf ? operationData.devis_pdf : 'Aucun fichier PDF téléchargé'
    });
  } catch (err) {
    console.error('Erreur lors de l\'insertion des opérations:', err);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement des opérations' });
  }
});

// Route pour servir les fichiers PDF
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route pour uploader une photo pour un SOA spécifique
app.post('/api/soa/:id/photo', upload.single('photo'), async (req, res) => {
  const { id } = req.params;

  // Vérifiez si le fichier a été uploadé
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun photo n\'a été uploadé.' });
  }

  const photoPath = req.file.filename; // Chemin du fichier uploadé

  try {
    const soa = await Soa.findByPk(id);
    if (!soa) {
      return res.status(404).json({ message: 'SOA non trouvé' });
    }

    // Mise à jour du champ photo
    soa.photo = photoPath;
    await soa.save();

    res.json({ photo: photoPath });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la photo:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de la photo', error: error.message });
  }
});

// Route pour servir les fichiers statiques (photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Émettre un événement à tous les clients lorsqu'une modification est effectuée
const emitDataUpdate = () => {
  db.query('SELECT * FROM soa', (err, results) => {
    if (!err) {
      io.emit('dataUpdated', results);
    }
  });
};

// WebSocket pour la connexion des clients
io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté');
  });
});

// Route pour obtenir les SOA par commune_id
app.get('/api/soa', async (req, res) => {
  const commune_id = parseInt(req.query.commune_id, 10); // Convertir en entier

  if (isNaN(commune_id)) {
    return res.status(400).json({ error: 'commune_id doit être un nombre valide' });
  }

  try {
    const results = await Soa.findAll({ where: { commune_id } });
    res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});


// Route pour modifier un SOA
app.put('/api/soa/:id', async (req, res) => {
  const { nom } = req.body;
  const { id } = req.params;

  if (!nom) {
    return res.status(400).json({ error: 'Nom est requis' });
  }

  try {
    const soa = await Soa.update({ nom }, { where: { id } });
    emitDataUpdate();
    res.status(200).json({ message: 'SOA modifié avec succès' });
  } catch (err) {
    console.error('Erreur lors de la modification du SOA:', err);
    res.status(500).json({ error: 'Erreur lors de la modification du SOA' });
  }
});

// Route pour supprimer un SOA avec ses opérations associées
app.delete('/api/soa/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Supprimer toutes les opérations associées au SOA
    await Operation.destroy({
      where: { soa_id: id }
    });

    // Ensuite, supprimer le SOA
    const soa = await Soa.destroy({
      where: { id: id }
    });

    if (soa) {
      emitDataUpdate(); // Si vous utilisez des websockets ou un système de notification
      return res.status(200).json({ message: 'SOA et opérations supprimés avec succès' });
    } else {
      return res.status(404).json({ error: 'SOA non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du SOA:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du SOA' });
  }
});

// Route pour ajouter un SOA
app.post('/api/soa', async (req, res) => {
  const { nom, commune_id } = req.body;
  if (!nom || !commune_id) {
    return res.status(400).json({ error: 'Nom et commune_id sont requis' });
  }

  try {
    const soa = await Soa.create({ nom, commune_id });
    res.status(201).json({ message: 'SOA ajouté avec succès', soaId: soa.id });
  } catch (err) {
    console.error('Erreur lors de l\'ajout du SOA:', err);
    res.status(500).json({ error: 'Erreur lors de l\'ajout du SOA' });
  }
});

// Route pour afficher les opérations
app.get('/api/operations', async (req, res) => {
  const { annee } = req.query;

  if (!annee) {
    return res.status(400).json({ error: "L'année est requise" });
  }

  try {
    const operations = await Operation.findAll({
      where: { annee },
      include: [
        {
          model: Soa, // Inclure les informations du SOA associé
          attributes: ['nom', 'commune_id'] // Sélectionner les colonnes du SOA à inclure
        }
      ]
    });

    // Transformer le résultat pour inclure les noms et autres informations du SOA
    const formattedOperations = operations.map(operation => ({
      id: operation.id,
      soa_id: operation.soa_id,
      annee: operation.annee,
      recensement: operation.recensement,
      attribution: operation.attribution,
      retrait: operation.retrait,
      bail: operation.bail,
      devis: operation.devis,
      quitus: operation.quitus,
      etatdeslieux: operation.etatdeslieux,
      soa_nom: operation.Soa.nom, // Inclure le nom du SOA
      commune_id: operation.Soa.commune_id // Inclure la commune associée
    }));

    if (formattedOperations.length === 0) {
      return res.status(404).json({ message: 'Aucune opération trouvée pour cette année' });
    }

    res.json(formattedOperations);
  } catch (err) {
    console.error('Erreur lors de la récupération des opérations:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des opérations' });
  }
});

// Ajout bail
app.post('/api/suivi_bail', upload.single('scan'), async (req, res) => {
  const { entite, type_de_bail, beneficiaire, district, duree, date_d_effet } = req.body;

  // Vérifiez que tous les champs requis sont présents
  if (!entite || !type_de_bail || !beneficiaire || !district || !duree || !date_d_effet || !req.file) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Convertir date_d_effet en objet Date
    const dateEffet = new Date(date_d_effet);
    // Calculer la date de fin en ajoutant la durée (en années)
    const dateFin = new Date(dateEffet);
    dateFin.setFullYear(dateFin.getFullYear() + Number(duree)); // Ajouter la durée à la date d'effet

    const suiviBail = await SuiviBail.create({
      entite,
      type_de_bail,
      beneficiaire,
      district,
      duree: Number(duree), // Assurez-vous que duree est un nombre
      date_d_effet: dateEffet,
      scan: req.file.filename, // Enregistrez le nom de fichier
      fin: dateFin // Date de fin calculée
    });

    res.status(201).json({ message: 'Entrée de bail créée avec succès', suiviBail });
  } catch (err) {
    console.error('Erreur lors de la création de l\'entrée de bail:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'entrée de bail' });
  }
});

// Lire toutes les bails
app.get('/api/suivi_bail', async (req, res) => {
  try {
    const suiviBails = await SuiviBail.findAll();
    res.json(suiviBails);
  } catch (err) {
    console.error('Erreur lors de la récupération des données:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

// Lire une seule bail par ID
app.get('/api/suivi_bail/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }
    res.json(suiviBail);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'entrée:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'entrée' });
  }
});

// Mettre à jour bail par ID
app.put('/api/suivi_bail/:id', upload.single('scan'), async (req, res) => {
  const { id } = req.params;
  const { entite, type_de_bail, beneficiaire, district, duree, date_d_effet } = req.body;

  try {
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }

    // Convertir date_d_effet en objet Date
    const dateEffet = new Date(date_d_effet);
    if (isNaN(dateEffet)) {
      return res.status(400).json({ error: 'Date d\'effet invalide' });
    }

    // Calculer la date de fin en ajoutant la durée (en années)
    const dateFin = new Date(dateEffet);
    dateFin.setFullYear(dateFin.getFullYear() + Number(duree)); // Ajouter la durée à la date d'effet

    // Debugging: Log if a new file is uploaded
    console.log('Fichier téléchargé:', req.file ? req.file.filename : 'Pas de fichier téléchargé');

    // Mise à jour des champs
    await suiviBail.update({
      entite,
      type_de_bail,
      beneficiaire,
      district,
      duree: Number(duree), // Assurez-vous que duree est un nombre
      date_d_effet: dateEffet,
      scan: req.file ? req.file.filename : suiviBail.scan, // Mettre à jour le scan si un nouveau fichier est téléchargé
      fin: dateFin // Date de fin calculée
    });

    res.json({ message: 'Entrée de bail mise à jour avec succès', suiviBail });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'entrée:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entrée' });
  }
});

// Supprimer bail par ID
app.delete('/api/suivi_bail/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }
    await suiviBail.destroy();
    res.json({ message: 'Entrée de bail supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'entrée:', err);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'entrée' });
  }
});

// Route pour servir le scan (PDF) d'un suivi de bail
app.get('/api/suivi_bail/:id/scan', async (req, res) => {
  const { id } = req.params;

  try {
    // Trouver l'entrée de suivi de bail par ID
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail || !suiviBail.scan) {
      return res.status(404).json({ error: 'Entrée non trouvée ou aucun scan associé' });
    }

    const filePath = path.join(__dirname, 'uploads', suiviBail.scan);
    
    // Vérifiez si le fichier existe avant de l'envoyer
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf'); // Définir le type de contenu
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`); // Ouvrir dans le navigateur
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du fichier:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'envoi du fichier' });
      }
    });
  } catch (err) {
    console.error('Erreur lors de la récupération du scan:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération du scan' });
  }
});

//servir pdf devis 
app.get('/api/operations/:id/devis_pdf', async (req, res) => {
  const { id } = req.params;
  console.log('ID reçu dans le backend:', id); // Ajoutez ceci pour vérifier l'ID

  if (!id) {
    return res.status(400).json({ error: 'ID de l\'opération requis.' });
  }

  try {
    const operation = await Operation.findByPk(id);
    if (!operation || !operation.devis_pdf) {
      return res.status(404).json({ error: 'PDF non trouvé pour cette opération.' });
    }

    const filePath = path.join(__dirname, 'uploads', operation.devis_pdf);
    
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Erreur lors de l\'envoi du fichier:', err);
        res.status(err.status).end();
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du PDF:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du PDF' });
  }
});

// Synchronisation des modèles avec la base de données
db.sync({ alter: true })
  .then(() => {
    console.log('Les modèles ont été synchronisés avec la base de données.');
    server.listen(5000, () => {
      console.log('Server running on port 5000');
    });
  })
  .catch((error) => {
    console.error('Erreur lors de la synchronisation des modèles:', error);
  });


