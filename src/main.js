const config = require('../config.json');

const path = require('node:path');
const fs = require('node:fs');

const Valkey = require('iovalkey');
const express = require('express');
const sf = require('nodejs-snowflake');
const mt = require('microtime');

let avgDelay = 0;
let avgC = 1;

const app = express();
app.use(express.raw({ type: '*/*' }));
app.use((req, res, next) => {
	req.__recv = mt.now();

	res.on('close', async () => {
		const delay = mt.now()-req.__recv;

		process.stdout.write(`${new Date()} | ${req.ip} -> ${req.method} ${req.path} ${res.statusCode} (${mt.now()-req.__recv}ns)\n`);

		if (avgC === 1) {
			avgDelay = delay;
			avgC = 1;
		} else {
			const x = avgDelay*avgC;
			const y = x+delay;
			const z = y/avgC++;

			avgDelay = z;
		}
	});
	next();
});

setInterval(() => {
	if (avgDelay.length !== 0) {
		process.stdout.write(`Average response time: ${avgDelay}ns\n`);
	}
}, 30000);

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

	if ((await globalThis.db.get('guildArr')) == null) {
		await globalThis.db.set('guildArr', JSON.stringify([]));
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
