module.exports = {
	method: 'get',
	path: '/users',
	async exec(req, res) {
		let userArr;

		userArr = await globalThis.db.get('userArr');

		res.send(JSON.stringify({
			status: 200,
			error: 0,
			payload: {
				ids: userArr
			}
		}));
	}
}
