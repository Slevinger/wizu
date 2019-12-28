const MongoClient = require('mongodb')
const APIUsersDb = require('./dbActions/APIUsersDb')
const APIToDoListDb = require('./dbActions/APIToDoListDb')
const APISurveysDb = require('./dbActions/APISurveysDb')
const APIEventsDb = require('./dbActions/APIEventsDb')
const meta = require('./dbStruct')


class DataBase {
  constructor() {
    this.meta = meta;
    this.DB_NAME = 'wiz_u_db';
    this.url = `mongodb://localhost:27017`;
    MongoClient.connect(this.url).then((res, err) => {
      if (err) throw err;
      this.db = res;
      this.dbo = res.db(this.DB_NAME);
      this.usersApi = new APIUsersDb(this.db, this.dbo,this);
      this.eventsApi = new APIEventsDb(this.db,this.dbo,this);
      this.todolistApi = new APIToDoListDb(this.db,this.dbo,this);
      // this.surveysApi = new APIActionItemsDb(db,dbo);
      this.validateToken = async function (user_id, token) {
        let credentials = await this.dbo.collection('users').
          findOne({
            _id: new MongoClient.ObjectId(user_id),
            token:token
          });

          return credentials;
      }
      console.log('db connected')
    });
  }

}


module.exports = DataBase;
