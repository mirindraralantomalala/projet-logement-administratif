const { DataTypes } = require('sequelize');
const sequelize = require('../db'); // Votre instance Sequelize

const File = sequelize.define('File', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  data: {
    type: DataTypes.BLOB('long'), // Utilisez BLOB pour les données binaires
    allowNull: false,
  },
});

module.exports = File;
