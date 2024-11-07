const { Model, DataTypes } = require('sequelize');
const sequelize = require('../db');

class Soa extends Model {
  static associate(models) {
    Soa.hasMany(models.Operation, { foreignKey: 'soa_id' }); // Association One-to-Many
  }
}

Soa.init({
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  commune_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  photo: {
    type: DataTypes.STRING,
  },
}, {
  sequelize,
  modelName: 'Soa',
  tableName: 'soa', // Spécifiez le nom de la table
  timestamps: true // Pour les champs createdAt et updatedAt
});


module.exports = Soa;