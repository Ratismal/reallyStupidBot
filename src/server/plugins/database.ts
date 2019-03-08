import db from '../../data/models';

import Loggr from '$loggr';
const console = Loggr.get('Database');

export class Database {
	name: string = 'Database';

	[key: string]: any;

	public async onLoad() {
		// console.log(db);
		for (const key in db) {
			console.log('Loading', key);
			if (db[key]) {
				this[key] = db[key];
			}
		}
	}

	get db() {
		return db;
	}

	get literal() {
		return db.sequelize.literal;
	}

	get Op() {
		return db.Sequelize.Op;
	}
}
