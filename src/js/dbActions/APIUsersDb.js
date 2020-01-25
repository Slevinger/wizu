const ObjectId = require("mongodb").ObjectId;
const randomstring = require("randomstring");
const meta = require("../dbStruct").meta;
const isEmpty = require("lodash").isEmpty;

class APIUsersDb {
  constructor(db, dbo, dataBase) {
    this.db = db;
    this.dbo = dbo;
    this.dataBase = dataBase;
  }
  async removeEventFromUser(event_id, usernames) {
    return Promise.all(
      usernames.map(username =>
        this.dbo
          .collection("users")
          .update(
            { username },
            { $pull: { events: new ObjectId(event_id) } },
            { multi: true }
          )
      )
    );
  }

  async addUser(username, password, email, firstname, lastname) {
    try {
      const userData = await this.dbo.collection("users").findOne({ username });
      if (!username || !password || !email || !firstname || !lastname) {
        return { error: ` you are missing parameters` };
      } else if (userData) {
        return { error: `user with the name ${username}, allready exists` };
      } else {
        let user = JSON.parse(JSON.stringify(meta().user));
        user.username = username;
        user.password = password;
        user.email = email;
        Object.assign(user.fullname, { first: firstname, last: lastname });
        const res = this.dbo.collection("users").insertOne(user);
        return { message: res };
      }
    } catch (error) {
      console.log("APIUsersDb.addUser", error);
      return { error };
    }
  }

  async addEventToUsers(event_id, usernames) {
    return await Promise.all(
      usernames.map(username => {
        this.dbo
          .collection("users")
          .updateOne(
            { username },
            { $push: { events: new ObjectId(event_id) } }
          );
      })
    );
  }

  async removeUser(username) {
    try {
      let user = await this.dbo
        .collection("users")
        .findOneAndDelete({ username });
      // remove user from events
      // remove user from correspondences
      return user.value;
    } catch (error) {
      console.log("apiUsersDb.removeUser");
      return { error };
    }
  }

  async getUsers(userList) {
    const query =
      isEmpty(userList) || userList[0] === ""
        ? {}
        : { username: { $in: userList } };
    const users = [];
    const ans = await this.dbo
      .collection("users")
      .find(query)
      .forEach(({ _id, username, email, events, action_items }) => {
        console.log({
          user_id: _id.toString(),
          username,
          email,
          events,
          action_items
        });
        users.push({
          user_id: _id.toString(),
          username,
          email,
          events,
          action_items
        });
      });
    return users;
  }

  async setPassword(username, old_password, new_password, token) {
    try {
      let res = await this.dbo.collection("users").updateOne(
        {
          username,
          token,
          password: old_password
        },
        { $set: { password: new_password } }
      );
      if (res.result.n == 0) {
        return { error: `the password dont match your own` };
      }
      return { message: "ok" };
    } catch (error) {
      console.log("APIUsersDb.setPassword", error);
      return { error };
    }
  }

  async setEmail(username, password, new_mail, token, respond) {
    try {
      let res = await this.dbo.collection("users").updateOne(
        {
          username,
          token,
          password: password
        },
        { $set: { email: new_mail } }
      );
      if (res.result.n == 0) {
        return { error: `the password dont match your own` };
      }
    } catch (error) {
      console.log("APIUsersDb.setEmail", error);
      return { error };
    }
  }

  async setName(username, first_name, last_name, token) {
    try {
      if (first_name || last_name) {
        let setObj = {};
        if (first_name) setObj["fullname.first_name"] = first_name;
        if (last_name) setObj["fullname.last_name"] = last_name;
        let res = await this.dbo.collection("users").updateOne(
          {
            username,
            token: token
          },
          { $set: setObj }
        );
        if (res.result.n == 0) {
          return { error: `you session is over` };
        }
      } else {
        return {
          error: "to change name you have to set at least one parameter"
        };
      }
    } catch (error) {
      console.log("APIUsersDb.setName", error);
      return { error };
    }
  }

  async addDetails(username, detail_key, value, token, respond) {
    try {
      let upsertObj = {};
      upsertObj[detail_key] = value;
      if (detail_key && value) {
        let res = await this.dbo.collection("users").updateOne(
          {
            username,
            token: token
          },
          { $set: upsertObj }
        );
      } else if (detail_key && !value) {
        upsertObj[detail_key] = 1;
        let res = await this.dbo.collection("users").updateOne(
          {
            username,
            token: token
          },
          { $unset: upsertObj }
        );
        respond(200, `detail "${detail_key} was removed`);
      } else {
        respond(400, `you cannot set ${detail_key} to -> ${value}`);
      }
    } catch (err) {
      console.log(err);
      respond(401, err);
    }
  }

  async logout(username, token) {
    try {
      let res = await this.dbo.collection("users").updateOne(
        {
          username
        },
        { $unset: { token: 1 } }
      );
      if (res.result.n == 0) {
        return { error: "could not logout" };
      }
      return { message: "ok" };
    } catch (error) {
      console.log("APIUsersDb.logout", error);
      return { error };
    }
  }

  async addCorrespondenceToUser(correspondenceId, username) {
    return await this.dbo
      .collection("users")
      .updateOne(
        { username },
        { $addToSet: { correspondences: correspondenceId } }
      );
  }

  async login(username, password) {
    let query = {
      username,
      password
    };
    if (!password) {
      throw new Error("you must fill the password field");
    }
    if (!username) {
      throw new Error("you must have fill in Username");
    } else {
      let token = randomstring.generate({
        length: 12,
        charset: "alphanumeric"
      });
      let res = await this.dbo.collection("users").findOneAndUpdate(
        query,
        { $set: { token } },
        {
          returnNewDocument: true
        }
      );
      console.log(res);
      if (res.ok && res.value) {
        const { username, token, _id: user_id } = res.value;
        return { username, token, _id: user_id };
      } else {
        throw new Error(`one or more of your credentials is wrong`);
      }
    }
  }
}

module.exports = APIUsersDb;
