
const MongoClient = require('mongodb')
const DB_NAME = 'wiz_u_db';
const url = `mongodb://localhost:27017`;

// create the database


MongoClient.connect(url + '/' + DB_NAME, function (err, db) {
  if (err) throw 'connect error';
  console.log("Database conneected!");
  db.close();
});




createActionItem = async function(descr, have, need, unit, cost,user_id,eventId){
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const aItem = JSON.parse(JSON.stringify(meta().action_item));
    nextActionItemId = await dbo.collection('action_items').find({},{_id:0,aid:1}).sort({aid:-1}).limit(1).toArray();
    if (nextActionItemId.length == 0) {
      nextActionItemId = 0;
    } else {
      nextActionItemId = nextActionItemId[0].aid+1;
    }
    aItem.aid = nextActionItemId;
    aItem.description = descr;
    aItem.have = have;
    aItem.needed = need;
    aItem.unit = unit;
    aItem.cost = cost;
    if (eventId)
      aItem.event_id = new MongoClient.ObjectId(eventId);
    
    if (user_id)
      aItem.user_id = new MongoClient.ObjectId(user_id);

    return await dbo.collection('action_items').insertOne(aItem);

  }
  catch (err) {
    console.log(err);
  }
}


exports.addActionItemToList = async function(descr, have, need, unit, cost,user_id,listId){
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const event = await dbo.collection('').findOne({_id:new MongoClient.ObjectId(listId)});
    if (event){
      let actionItem = createActionItem(descr, have, need, unit, cost,user_id,eventId)
      const res = await dbo.collection('events').updateOne(
        { _id: new MongoClient.ObjectId(eventId) },
        { $addToSet: { users: new MongoClient.ObjectId(userId) } }
      )
      console.log(res);
      db.close()
    }
  }
  catch (err){
    console.log(err);
  }
}

exports.getActionItems = async function(eventid){
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
  }
  catch (err) {
    console.log(err)
  }
}

exports.addUserToEvent = async function (eventId, userId, errResponse) {
  // const res = await 
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const user = await dbo.collection('users').findOne({ "_id": new MongoClient.ObjectId(userId) });
    if (user) {
      db.close();
      errResponse(200, `user with the id ${userId}, does not exists`);
    } else {
      const eventData = await dbo.collection('events').findOne(
        { _id: new MongoClient.ObjectId(eventId) });
      if (eventData.users.filter(user => { user.getValue() == userId }).length > 0) {
        db.close();
        errResponse(200, `user with the id ${userId}, is allready in the ${eventId} `);
      } else {
        const res = await dbo.collection('events').updateOne(
          { _id: new MongoClient.ObjectId(eventId) },
          { $addToSet: { users: new MongoClient.ObjectId(userId) } }
        )
        console.log(res);
        db.close()
      }

    }
  }
  catch (err) {
    console.log(err);
  }
}

exports.removeUserFromEvent = async function (eventId, userId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const res = await dbo.collection('events').updateOne(
      { _id: new MongoClient.ObjectId(eventId) },
      { $pull: { users: new MongoClient.ObjectId(userId) } }
    )
    console.log(res);
    db.close()
  }
  catch (err) {
    console.log(err);
  }
}



createStickeyNote = async function (objectId, header, txt) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const note = JSON.parse(JSON.stringify(meta().stickey_note));
    note.title = header;
    note.description = txt;
    note.onwer = new MongoClient.ObjectId(objectId);
    note = await dbo.collection('stickey_notes').insertOne(note);
    const stickeyId = note.insertedId.toString();
    db.close();
    return stickeyId;
  }
  catch (err) {
    console.log(err);
  }

}
addStickeyNoteToEvent = async function (objectId, noteId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const res = await dbo.collection('events').updateOne(
      { _id: new MongoClient.ObjectId(objectId) },
      { $addToSet: { stickey_notes: new MongoClient.ObjectId(noteId) } }
    )
    console.log(res);
    db.close()
  }
  catch (err) {
    console.log(err);
  }
}

exports.addStickeyNote = async function (objectId, txt) {
  let noteId = await createStickeyNote(objectId, txt);
  addStickeyNoteToEvent(objectId, noteId);
}

exports.removeStickeyNoteFromEvent = async function (stickeyId, eventId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const res = await dbo.collection('events').updateOne(
      { _id: new MongoClient.ObjectId(eventId) },
      { $pull: { stickey_notes: new MongoClient.ObjectId(stickeyId) } }
    )
    console.log(res);
    db.close()
  }
  catch (err) {
    console.log(err);
  }
}

exports.addAdminToEvent = async function (userId, eventId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const res = await dbo.collection('events').updateOne(
      { _id: new MongoClient.ObjectId(eventId) },
      { $addToSet: { administrators: new MongoClient.ObjectId(userId) } }
    )
    console.log(res);
    db.close()
  }
  catch (err) {
    console.log(err);
  }
}

exports.removeAdminFromEvent = async function (userId, eventId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    const res = await dbo.collection('events').updateOne(
      { _id: new MongoClient.ObjectId(eventId) },
      { $pull: { administrators: new MongoClient.ObjectId(userId) } }
    )
    console.log(res);
    db.close()
  }
  catch (err) {
    console.log(err);
  }
}

exports.updateEventField = async function (title, eventId, value) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    let obj = {}
    obj[title] = value;
    await dbo.collection('events').updateOne({ _id: new MongoClient.ObjectID(eventId) }, { $set: obj });
    db.close();
  }
  catch (err) {
    console.log(err);
  }
}

exports.removeEvent = async function (eventId) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    await dbo.collection('events').deleteOne({ _id: new MongoClient.ObjectID(eventId) });
    db.close();
  }
  catch (err) {
    console.log(err);
  }
}

exports.addEvent = async function (name, description, date, location, event_nature) {
  try {
    const db = await MongoClient.connect(url);
    const dbo = db.db(DB_NAME);
    let event = JSON.parse(JSON.stringify(meta().event));
    event.name = name;
    event.description = description;
    event.date = date;
    event.location = location;
    event.name = name;
    event.event_nature = event_nature;
    const obj = await dbo.collection('events').insertOne(event);
    const id = obj.insertedId.toString();

    db.close();
    return id;
  }
  catch (err) {
    console.log(err);
  }
}
// const collectionName = 'shirTest';

// createCollection(collectionName);
// addToCollection(collectionName,{name:'shir'});
// findOneInDB(collectionName);
