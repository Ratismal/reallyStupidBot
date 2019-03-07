'use strict';
module.exports = (sequelize, DataTypes) => {
  const auth = sequelize.define('auth', {
    username: DataTypes.STRING
  }, {});
  auth.associate = function(models) {
    // associations can be defined here
  };
  return auth;
};