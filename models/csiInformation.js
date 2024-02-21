const { DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

const CSIInformation = sequelize.define("CSIInformation", {
  data: {
    type: DataTypes.JSON, // Adjust the data type according to your requirements
    allowNull: false,
  },
});

module.exports = CSIInformation;
