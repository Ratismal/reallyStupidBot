const fs = require('fs');
const path = require('path');

let dirbase = path.join(__dirname, '..', 'img');
let dirs = fs.readdirSync(dirbase);
let base = path.join(__dirname, '..', 'src', 'client', 'static', 'img');

for (const dir of dirs) {
	try {
		fs.mkdirSync(path.join(base, dir));
	} catch (err) { }
	const files = fs.readdirSync(path.join(dirbase, dir));
	for (const file of files) {
		if (/(\.gif|\.png)$/.test(file)) {
			console.log('Copying', path.join(dir, file));

			fs.copyFileSync(path.join(dirbase, dir, file), path.join(base, dir, file));
		}
	}
}