module.exports = {
	method: 'get',
	path: '/users/*',
	async exec(req, res) {
		const uid = req.path.split('/')[2];

		let userArr;
		let userData;

		userArr = JSON.parse(await globalThis.db.get('userArr'));
		if (!userArr.includes(uid)) {
			res.status(404).send(JSON.stringify({
				status: 400,
				ok: 0
			}));

			return;
		}

		userData = await globalThis.db.get(`user_${uid}`);

		if (userData === null) {
			res.status(400).send(JSON.stringify({
				status: 400,
				ok: 0
			}));

			return;
		}

		return res.end(JSON.stringify({
			status: 200,
			ok: 1,
			payload: userData
		}));
	}
}
