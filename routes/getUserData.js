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
				error: 1
			}));

			return;
		}

		userData = await globalThis.db.get(`user_${uid}`);

		if (userData === null) {
			res.status(400).send(JSON.stringify({
				error: 2
			}));

			return;
		}

		return res.end(JSON.stringify({
			error: 0,
			payload: userData
		}));
	}
}
