import db from '../../data/models';

import {
	Plugin,
} from '@ayana/bento';

import Loggr from '$loggr';
const console = Loggr.get('Database');

export class Database implements Plugin {
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

	public async onComponentLoad(component: any): Promise<void> {
		component.db = this;
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
