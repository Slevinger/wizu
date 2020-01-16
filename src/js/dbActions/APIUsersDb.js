const ObjectId = require('mongodb').ObjectId;
const randomstring = require('randomstring');
const meta = require('../dbStruct').meta;

class APIUsersDb {
	constructor(db, dbo, dataBase) {
		this.db = db;
		this.dbo = dbo;
		this.dataBase = dataBase;
	}

	async addUser(username, password, email, firstname, lastname, respond) {
		try{
			const userData = await this.dbo.collection('users').findOne({ username });
			if(!username || !password || !email || !firstname || !lastname){
				respond(400, ` you are missing parameters`);
			} else if(userData){
				respond(400, `user with the name ${username}, allready exists`);
			} else{
				let user = JSON.parse(JSON.stringify(meta().user));
				user.username = username;
				user.password = password;
				user.email = email;
				Object.assign(user.fullname, { first: firstname, last: lastname });
				this.dbo.collection('users').insertOne(user);
			}
		} catch(err){
			respond(401, err);
			console.log(err);
		}
	}

	async removeUser(user_id, respond) {
		try{
			let user = await this.dbo.collection('users').findOneAndDelete({ _id: new ObjectId(user_id) });
			return user.value;
		} catch(err){
			respond(401, err);
			console.log(err);
		}
	}

	async setPassword(user_id, old_password, new_password, token, respond) {
		try{
			let res = await this.dbo.collection('users').updateOne({
				_id: new ObjectId(user_id),
				token,
				password: old_password
			}, { $set: { password: new_password } });
			if(res.result.n == 0){
				respond(400, `the password dont match your own`);
			}
		} catch(err){
			respond(400, err);
			console.log(err);
		}
	}

	async setEmail(user_id, password, new_mail, token, respond) {
		try{
			let res = await this.dbo.collection('users').updateOne({
				_id: new ObjectId(user_id),
				token,
				password: password
			}, { $set: { email: new_mail } });
			if(res.result.n == 0){
				respond(400, `the password dont match your own`);
			}
		} catch(err){
			respond(400, err);
			console.log(err);
		}
	}

	async setName(user_id, first_name, last_name, token, respond) {
		try{
			if(first_name || last_name){
				let setObj = {};
				if(first_name) setObj['fullname.first_name'] = first_name;
				if(last_name) setObj['fullname.last_name'] = last_name;
				let res = await this.dbo.collection('users').updateOne({
					_id: new ObjectId(user_id),
					token: token
				}, { $set: setObj });
				if(res.result.n == 0){
					respond(400, `you session is over`);
				}
			} else{
				respond(400, 'to change name you have to set at least one parameter');
			}
		} catch(err){
			console.log(err);
			respond(401, err);
		}
	}

	async addDetails(user_id, detail_key, value, token, respond) {
		try{
			let upsertObj = {};
			upsertObj[detail_key] = value;
			if(detail_key && value){
				let res = await this.dbo.collection('users').updateOne({
					_id: new ObjectId(user_id),
					token: token
				}, { $set: upsertObj });
			} else if(detail_key && !value){
				upsertObj[detail_key] = 1;
				let res = await this.dbo.collection('users').updateOne({
					_id: new ObjectId(user_id),
					token: token
				}, { $unset: upsertObj });
				respond(200, `detail "${detail_key} was removed`);
			} else{
				respond(400, `you cannot set ${detail_key} to -> ${value}`);
			}
		} catch(err){
			console.log(err);
			respond(401, err);
		}
	}

	async logout(user_id, token, respond) {
		try{
			let res = await this.dbo.collection('users').updateOne({
				_id: new ObjectId(user_id),
				token: token
			}, { $unset: { token: 1 } });
			if(res.result.n == 0){
				respond(400, 'could not logout');
			}
		} catch(err){
			console.log(err);
			respond(400, err);
		}
	}

	async login(username, email, password, respond) {
		try{
			let query = {};
			if(!username && !email){
				respond(400, `you must have at least one of the following Username/Email`);
			} else{
				if(username) query.username = username;
				if(email) query.email = email;
				if(password){
					query.password = password;
				} else{
					respond(400, 'you must fill the password field');
				}
				let token = randomstring.generate({
					length: 12,
					charset: 'alphanumeric'
				});
				let user = 1;
				console.log(user)
				let res = await this.dbo.collection('users').findOneAndUpdate(
					query,
					{ $set: { token } },
					{
						returnNewDocument: true
					},(err,doc)=>{
						console.log(doc);
					});
				if(res.result.n == 0){
					respond(401, `one or more of your credentials is wrong`);
				}
				console.log(res.toJSON());

				return token;
			}
		} catch(err){
			console.log(err);
		}
	}
}

module.exports = APIUsersDb;
