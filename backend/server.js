const express = require('express');
const cors = require('cors');
const db = require('./db'); 
const http = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const Operation = require('./models/Operation'); 
const Soa = require('./models/Soa'); 
const SuiviBail = require('./models/SuiviBail');
const File = require('./models/File');
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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true); 
  } else {
    cb(new Error('Seuls les fichiers PDF, JPEG et PNG sont autorisés'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;

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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/soa/:id/photo', upload.single('photo'), async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: 'Aucun photo n\'a été uploadé.' });
  }

  const photoPath = req.file.filename; 

  try {
    const soa = await Soa.findByPk(id);
    if (!soa) {
      return res.status(404).json({ message: 'SOA non trouvé' });
    }

    soa.photo = photoPath;
    await soa.save();

    res.json({ photo: photoPath });
  } catch (error) {
    console.error('Erreur lors du téléchargement de la photo:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement de la photo', error: error.message });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const emitDataUpdate = () => {
  db.query('SELECT * FROM soa', (err, results) => {
    if (!err) {
      io.emit('dataUpdated', results);
    }
  });
};

io.on('connection', (socket) => {
  console.log('Un client s\'est connecté');

  socket.on('disconnect', () => {
    console.log('Un client s\'est déconnecté');
  });
});

app.get('/api/soa', async (req, res) => {
  const commune_id = parseInt(req.query.commune_id, 10);

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

app.delete('/api/soa/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await Operation.destroy({
      where: { soa_id: id }
    });

    const soa = await Soa.destroy({
      where: { id: id }
    });

    if (soa) {
      emitDataUpdate();
      return res.status(200).json({ message: 'SOA et opérations supprimés avec succès' });
    } else {
      return res.status(404).json({ error: 'SOA non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du SOA:', error);
    return res.status(500).json({ error: 'Erreur lors de la suppression du SOA' });
  }
});

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
          model: Soa,
          attributes: ['nom', 'commune_id']
        }
      ]
    });

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
      soa_nom: operation.Soa.nom,
      commune_id: operation.Soa.commune_id
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

app.post('/api/suivi_bail', upload.single('scan'), async (req, res) => {
  const { entite, type_de_bail, beneficiaire, district, duree, date_d_effet } = req.body;

  if (!entite || !type_de_bail || !beneficiaire || !district || !duree || !date_d_effet || !req.file) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const dateEffet = new Date(date_d_effet);
    const dateFin = new Date(dateEffet);
    dateFin.setFullYear(dateFin.getFullYear() + Number(duree));

    const suiviBail = await SuiviBail.create({
      entite,
      type_de_bail,
      beneficiaire,
      district,
      duree: Number(duree),
      date_d_effet: dateEffet,
      scan: req.file.filename,
      fin: dateFin
    });

    res.status(201).json({ message: 'Entrée de bail créée avec succès', suiviBail });
  } catch (err) {
    console.error('Erreur lors de la création de l\'entrée de bail:', err);
    res.status(500).json({ error: 'Erreur lors de la création de l\'entrée de bail' });
  }
});

app.get('/api/suivi_bail', async (req, res) => {
  try {
    const suiviBails = await SuiviBail.findAll();
    res.json(suiviBails);
  } catch (err) {
    console.error('Erreur lors de la récupération des données:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

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

app.put('/api/suivi_bail/:id', upload.single('scan'), async (req, res) => {
  const { id } = req.params;
  const { entite, type_de_bail, beneficiaire, district, duree, date_d_effet } = req.body;

  try {
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail) {
      return res.status(404).json({ error: 'Entrée non trouvée' });
    }

    const dateEffet = new Date(date_d_effet);
    if (isNaN(dateEffet)) {
      return res.status(400).json({ error: 'Date d\'effet invalide' });
    }

    const dateFin = new Date(dateEffet);
    dateFin.setFullYear(dateFin.getFullYear() + Number(duree));

    console.log('Fichier téléchargé:', req.file ? req.file.filename : 'Pas de fichier téléchargé');

    await suiviBail.update({
      entite,
      type_de_bail,
      beneficiaire,
      district,
      duree: Number(duree),
      date_d_effet: dateEffet,
      scan: req.file ? req.file.filename : suiviBail.scan,
      fin: dateFin
    });

    res.json({ message: 'Entrée de bail mise à jour avec succès', suiviBail });
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'entrée:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'entrée' });
  }
});

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

app.get('/api/suivi_bail/:id/scan', async (req, res) => {
  const { id } = req.params;

  try {
    const suiviBail = await SuiviBail.findByPk(id);
    if (!suiviBail || !suiviBail.scan) {
      return res.status(404).json({ error: 'Entrée non trouvée ou aucun scan associé' });
    }

    const filePath = path.join(__dirname, 'uploads', suiviBail.scan);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
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
 
app.get('/api/operations/:id/devis_pdf', async (req, res) => {
  const { id } = req.params;
  console.log('ID reçu dans le backend:', id);

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

// Endpoint pour uploader un fichier
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;

    // Vérification de la présence du fichier
    if (!file) {
      return res.status(400).json({ message: 'Aucun fichier chargé.' });
    }

    // Enregistrement dans la base de données
    const newFile = await File.create({
      name: file.originalname, // Nom du fichier
      data: file.buffer,       // Données binaires
    });

    res.status(201).json({ message: 'Fichier uploadé avec succès.', fileId: newFile.id });
  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier :', error.message);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'upload du fichier.' });
  }
})


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


