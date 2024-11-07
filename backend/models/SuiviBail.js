// models/SuiviBail.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const SuiviBail = sequelize.define('SuiviBail', {
  entite: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type_de_bail: {
    type: DataTypes.ENUM('bureau', 'bureau logement', 'logement'),
    allowNull: false
  },
  beneficiaire: {
    type: DataTypes.STRING,
    allowNull: false
  },
  district: {
    type: DataTypes.ENUM('Antsirabe I', 'Antsirabe II', 'Betafo', 'Ambatolampy', 'Antanifotsy', 'Faratsiho', 'Mandoto'),
    allowNull: false
  },
  duree: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date_d_effet: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scan: {
    type: DataTypes.STRING, // Utilisez BLOB pour stocker des fichiers binaires (PDF, etc.)
    allowNull: false
  }
}, {
  tableName: 'suivi_bail',
  timestamps: false
});

module.exports = SuiviBail;
