'use strict';
module.exports = (sequelize: any, DataTypes: any) => {
	const auth = sequelize.define('auth', {
		id: {
			type: DataTypes.TEXT,
			primaryKey: true,
		},
		name: DataTypes.STRING,
		access_token: DataTypes.STRING,
		refresh_token: DataTypes.STRING,
	}, {});
	auth.associate = function(models: any) {
		// associations can be defined here
	};
	return auth;
};