// operation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Soa = require('./Soa'); // Assurez-vous que le modèle Soa est importé

const Operation = sequelize.define('Operation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, // Auto-increment pour l'ID
  },
  soa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Soa, // Utilisez directement le modèle Soa
      key: 'id'
    }
  },
  annee: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recensement: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  attribution: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  retrait: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  bail: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  devis: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  quitus: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  etatdeslieux: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  devis_pdf: {
    type: DataTypes.STRING,
    allowNull: true // Peut être null s'il n'y a pas de fichier joint
  }
}, {
  tableName: 'operations',
  timestamps: false // Désactivez ceci si vous n'avez pas besoin des champs createdAt et updatedAt
});

// Définir la relation Many-to-One entre Operation et Soa
Operation.belongsTo(Soa, { foreignKey: 'soa_id' });

module.exports = Operation;
