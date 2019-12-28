const ObjectId = require('mongodb').ObjectId
const meta = require('../dbStruct').meta

class APIEventsDb {
  
  constructor(db,dbo,dataBase){
    this.db = db;
    this.dbo = dbo;
    this.dataBase = dataBase;
  }
  async createEvent(name, description, date, location, event_nature,respond) {
    try {
      let event = JSON.parse(JSON.stringify(meta().event));
      if (!name){
        respond(400,'event must have a name');
      } else {
        event.name = name;
        event.description = description;
        event.date = date;
        event.location = location;
        event.name = name;
        event.event_nature = event_nature;
        const obj = await this.dbo.collection('events').insertOne(event);
        const id = obj.insertedId.toString();    
        return id;

      }
    }
    catch(err){
        respond(401,err);
    }
  }
  
  async removeEvent (eventId,respond) {
    try {
      await this.dbo.collection('events').deleteOne({ _id: new ObjectID(eventId) });
    }
    catch (err) {
      console.log(err);
      respond(401,err)
    }
  }

  
}
module.exports = APIEventsDb;