const meta = require("../dbStruct").meta;
const ObjectId = require("mongodb").ObjectId;

class APIEventsDb {
  constructor(db, dbo, dataBase) {
    this.db = db;
    this.dbo = dbo;
    this.dataBase = dataBase;
  }

  async getEvents(username) {
    const query = { username };
    const { events } = await this.dbo.collection("users").findOne(query);
    const ret = [];
    const res = await this.dbo
      .collection("events")
      .find({ _id: { $in: [...events] } })
      .forEach(event => {
        console.log(event);
        ret.push(event);
      });
    return ret;
  }

  async addUsersToEvent(usernames, event_id) {
    return await Promise.all(
      usernames.map(username =>
        this.dbo
          .collection("events")
          .updateOne(
            { _id: new ObjectId(event_id) },
            { $addToSet: { users: username } }
          )
      )
    );
  }
  // props = {event_id, trigger_username, username}
  async createCorrespondence(props) {
    const { event_id, trigger_username } = props;
    let correspondence = JSON.parse(JSON.stringify(meta(props).correspondence));
    if (!event_id || !trigger_username) {
      throw new Error("must send event_id and username");
    }
    const obj = await this.dbo
      .collection("correspondences")
      .insertOne(correspondence);
    const correspondenceId = obj.insertedId.toString();
    this._addCorrespondenceToEvent(correspondenceId, event_id, respond);
    return correspondenceId;
  }

  async addCorrespondenceToEvent(correspondenceId, event_id) {
    return await this.dbo
      .collection("events")
      .updateOne(
        { _id: new ObjectId(event_id) },
        { $addToSet: { correspondences: correspondenceId } },
        { upsert: true }
      );
  }

  async createEvent(props) {
    try {
      let event = JSON.parse(JSON.stringify(meta().event));
      if (!props.name) {
        return { error: "event must have a name" };
      } else {
        const obj = await this.dbo
          .collection("events")
          .insertOne({ ...event, ...props });

        const event_id = obj.insertedId.toString();
        return event_id;
      }
    } catch (error) {
      console.log("APIEventsDb.createEvent", error);
      return { error };
    }
  }

  async removeEvent(eventId) {
    return await this.dbo
      .collection("events")
      .findOneAndDelete({ _id: new ObjectId(eventId) });
  }

  async removeUsersFromEvent(event_id, usernames) {
    try {
      return await Promise.all(
        usernames.map(username => {
          this.dbo
            .collection("events")
            .updateOne(
              { _id: event_id },
              { $pull: { users: username, admin: username } },
              { multi: true }
            );
        })
      );
    } catch (error) {
      console.log("APIEventsDb.removeUsersFromEvent");
      return { error };
    }
  }
}
module.exports = APIEventsDb;
