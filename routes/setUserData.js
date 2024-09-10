module.exports = {
	method: 'post',
	path: '/users/*',
	async exec(req, res) {
		const uid = req.path.split('/')[2];
		let body;
		let userData;

		try {
			body = JSON.parse(req.body);
		} catch (e) {
			res.status(400).send(JSON.stringify({
				error: 1
			}));
			return;
		}

		if (
			typeof body.discriminator !== 'string' ||
			typeof body.identifier !== 'string' ||
			typeof body.username !== 'string' ||
			typeof body.passhash !== 'string' ||
			typeof body.disabled !== 'number'
		) {
			res.status(400).send(JSON.stringify({
				error: 2
			}));
			return;
		}

		try {
			userData = JSON.parse(await globalThis.db.get(`user_${uid}`));
		} catch (e) {
			res.status(400).send(JSON.stringify({
				error: 3
			}));
			return;
		}

		if (body.identifier !== userData.identifier) {
			res.status(400).send(JSON.stringify({
				error: 4
			}));
			return;
		}

		await globalThis.db.set(`user_${uid}`, JSON.stringify({
			discriminator: body.discriminator,
			identifier: body.identifier,
			username: body.username,
			passhash: body.passhash,
			disabled: body.disabled
		}));

		res.status(204).end();
		return;
	}
}
