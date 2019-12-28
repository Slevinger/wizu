const ObjectId = require('mongodb').ObjectId
const meta = require('../dbStruct').meta

class APIToDoListDb {

  constructor(db, dbo, dataBase) {
    this.db = db;
    this.dbo = dbo;
    this.dataBase = dataBase;
  }

  // return list_id
  async createList(title, descr, respond) {
    try {
      if (!title) {
        respond(400, `no title was given to list`)
      } else {
        let todo_list = meta().todo_list;
        todo_list.title = title;
        todo_list.description = descr;
        let res = await this.dbo.collection('todo_list').insertOne(todo_list);
        return res.insertedId.toString();
      }
    }
    catch (err) {
      console.log(err)
      respond(401, err);
    }
  }
  // void
  async changeListNameAndDescription(list_id, new_name, new_descr, respond) {
    try {
      if (!list_id || (!new_name && new_descr) || (new_name && !new_descr)) {
        respond(401, ' changeListName(list_id, new_name,respond)::no list_id/new_name provided')
      } else {
        let resObj = {};
        if (new_name) resObj['name'] = new_name;
        if (new_name) resObj['description'] = new_descr;
        let res = await this.dbo.collection('todo_list').updateOne({ _id: new ObjectId(list_id) }, { $set: resObj });
        if (res.result.n == 0) {
          respond(400, `changeListNameAndDescription(list_id, new_name, new_descr, respond):: could not find any lists with the id ${list_id}`);
        }
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  // void
  async removeItemFromList(list_id, aid, respond) {
    try {
      if (!list_id || !new_name) {
        respond(401, ' removeListFromEvent(list_id, event_id,respond)::no list_id/event_id provided')
      } else {
        this.dbo.collection('events').update(
          { _id: ObjectId(list_id) },
          { $pull: { action_items: new ObjectId(aid) } },
          { multi: true }
        )
      }
    }
    catch (err) {
      respond(401, err);
      console.log(err);
    }
  }
  // return item_id
  async createItemInList(user_id, descr, have, need, unit, cost, list_id, token, respond) {
    try {
      let credentials = await this.dataBase.validateToken(user_id, token);
      if (credentials) {
        let actionItemId = await this._createNewActionItem(user_id, descr, have, need, unit, cost);
        const res = await this.dbo.collection('todo_list').updateOne(
          { _id: new ObjectId(list_id) },
          { $addToSet: { action_items: new ObjectId(actionItemId) } }
        )
        return actionItemId;
      } else {
        respond(400, `token is not vaild`)
      }
    }
    catch (err) {
      respond(400, err)
      console.log(err)
    }
  }

  // return void
  async addItemToList(list_id, aid, respond) {
    try {
      if (!list_id || !aid) {
        respond(401, ' removeListFromEvent(list_id, aid,respond)::no list_id/aid provided')
      } else {
        const res = await this.dbo.collection('todo_list').updateOne(
          { _id: new ObjectId(list_id) },
          { $addToSet: { action_items: new ObjectId(aid) } }
        )
      }
    }
    catch (err) {
      respond(400, err);
      console.log(err)
    }
  }


  async addRowToActionItem(aid, user_id, quantity, payed, token, respond) {
    try {
      if (this.validateToken(token)) {
        const aItem = JSON.parse(JSON.stringify(meta().action_item));
        const aItemToAddTwo = await dbo.collection('action_items').find({ aid }).sort({ sub_id: -1 }).toArray();
        if (aItemToAddTwo.length > 0) {
          console.log(aItemToAddTwo)
          let lastItem = aItemToAddTwo[0];
          Object.assign(aItem, lastItem);
          delete aItem['_id'];
          aItem.user_id = new ObjectId(user_id);
          aItem.aid = lastItem.aid;
          aItem.have += quantity;
          aItem.needed -= quantity;
          aItem.cost -= payed;
          return await dbo.collection('action_items').insertOne(aItem);
        } else {
          respond(400, `item is not leagle`)
        }
      } else {
        respond(401, 'not a valid token');
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  async addListToEvent(list_id, event_id, respond) {
    try {
      if (event_id && list_id) {
        const res = await this.dbo.collection('events').updateOne(
          { _id: new ObjectId(event_id) },
          { $addToSet: { todo_lists: new ObjectId(list_id) } }

        )
      } else {
        respond(400, 'addListToEvent(list_id,event_id,respond)::your list_id or event_id is null')
      }
    }
    catch (err) {
      respond(401, err);
      console.log(err)
    }
  }

  async removeListFromEvent(list_id, event_id, respond) {
    try {
      if (!list_id || !new_name) {
        respond(401, ' removeListFromEvent(list_id, event_id,respond)::no list_id/event_id provided')
      } else {
        this.dbo.collection('events').update(
          { _id: ObjectId(event_id) },
          { $pull: { action_items: new ObjectId(list_id) } },
          { multi: true }
        )
      }
    }
    catch (err) {
      respond(401, err);
      console.log(err);
    }
  }



  async _createNewActionItem(user_id, descr, have, need, unit, cost,event_id) {
    const aItem = JSON.parse(JSON.stringify(meta().action_item));
    let nextActionItemId = await this.dbo.collection('action_items').find({}, { _id: 0, aid: 1 }).sort({ aid: -1 }).limit(1).toArray();
    if (nextActionItemId.length == 0) {
      nextActionItemId = 0;
    } else {
      nextActionItemId = nextActionItemId[0].aid + 1;
    }
    aItem.aid = nextActionItemId;
    aItem.description = descr;
    aItem.have = have;
    aItem.needed = need;
    aItem.unit = unit;
    aItem.cost = cost;
    if (event_id)
      aItem.event_id = new ObjectId(eventId);

    if (user_id)
      aItem.user_id = new ObjectId(user_id);

    let res = await this.dbo.collection('action_items').insertOne(aItem);
    return res.insertedId.toString();;
  }


}
module.exports = APIToDoListDb;