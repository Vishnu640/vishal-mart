const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Connected Successfully');
    await sequelize.sync({ force: false }); // auto create/update tables
    console.log('All tables synced');
  } catch (error) {
    console.error('DB Connection Failed:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
