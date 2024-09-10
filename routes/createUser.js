module.exports = {
	method: 'post',
	path: '/users/new',
	async exec(req, res) {
		let userArr;

		userArr = JSON.parse(await globalThis.db.get('userArr'));
		
		const id = globalThis.snowflakeGen.getUniqueID();

		userArr.push(id.toString());

		await globalThis.db.set('userArr', JSON.stringify(userArr));
		await globalThis.db.set(`user_${id.toString()}`, JSON.stringify({
			identifier: id.toString(),
			discriminator: '0000',
			username: `${id}`,
			passhash: 'no',
			disabled: 1
		}));

		res.status(200).send(JSON.stringify({
			error: 0,
			payload: {
				id: id.toString()
			}
		}));
	}
}
