const config = require('../config.json');

const path = require('node:path');
const fs = require('node:fs');

const Valkey = require('iovalkey');
const express = require('express');
const sf = require('nodejs-snowflake');

const app = express();
app.use(express.raw({ type: '*/*' }));
app.use((req, res, next) => {
	process.stdout.write(`${new Date()} | ${req.ip} -> ${req.method} ${req.path}\n`);
	next();
});

globalThis.snowflakeGen = new sf.Snowflake({
	custom_epoch: config.snowflake.custom_epoch,
	instance_id: 0
});

globalThis.loadDb = async () => {
	process.stdout.write('Connecting to database... ');

	globalThis.db = new Valkey();

	await new Promise((a) => globalThis.db.once('connect', a));

	process.stdout.write('Done');

	if ((await globalThis.db.get('userArr') == null)) {
		await globalThis.db.set('userArr', JSON.stringify([]));
	}

	process.stdout.write('\n');

	return;
}

globalThis.loadRoutes = () => {
	const routesDirectory = fs.readdirSync('./routes');

	process.stdout.write('Loading routes:\n');

	for (let i = 0; i < routesDirectory.length; i++) {
		const routeFile = path.join(__dirname, '../routes', routesDirectory[i]);
		const routeModule = require(routeFile);

		if (typeof routeModule !== 'object') throw new TypeError('routeModule is not an object!');
		if (typeof routeModule.method !== 'string') throw new TypeError('routeModule.method is not a string!');
		if (typeof routeModule.path !== 'string') throw new TypeError('routeModule.path is not a string!');
		if (typeof routeModule.exec !== 'function') throw new TypeError('routeModule.method is not a function!');

		app[routeModule.method](routeModule.path, routeModule.exec);

		process.stdout.write(`\t${routeModule.method} -> ${routeFile}\n`);
	}

	process.stdout.write('\n');

	return;
}

(async () => {
	process.stdout.write('Paradise (persistent storage)\n\n');

	await globalThis.loadDb();
	globalThis.loadRoutes();

	app.listen(config.server.port, () => {
		process.stdout.write(`Alright! Listening on HTTP (TCP) ${config.server.port}\n`);

		return;
	});
	return;
})();
