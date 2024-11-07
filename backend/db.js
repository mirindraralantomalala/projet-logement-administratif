// db.js
const { Sequelize } = require('sequelize');

// Remplacez par vos informations de connexion
const sequelize = new Sequelize('logement_administratif', 'root', '', {
  host: 'localhost',
  dialect: 'mysql', // ou le dialecte que vous utilisez
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

module.exports = sequelize;
