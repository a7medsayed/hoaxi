const Sequelize = require('sequelize');

const config = require('config');
const configDb = config.get('database');

const sequelize = new Sequelize(configDb.database , configDb.username,configDb.password,{
    dialect: configDb.dialect,
    storage: configDb.storage,
    logging: configDb.logging,
});

module.exports = sequelize;