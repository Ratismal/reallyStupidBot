'use strict';
module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('auths', {
			username: {
				primaryKey: true,
				type: Sequelize.STRING
			},
			accessToken: {
				type: Sequelize.STRING
			},
			refreshToken: {
				type: Sequelize.STRING
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE
			}
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('auths');
	}
};