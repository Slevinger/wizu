let bodyParser = require("body-parser");
const UsersApi = require("./apis/UsersApi");
const EventsApi = require("./apis/EventsApi");
const fileUpload = require("express-fileupload");
const DataBase = require("./dataBase");
const utils = require("./utils");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const admin = require("firebase-admin");
const googleStorage = require("@google-cloud/storage");
const Multer = require("multer");

var serviceAccount = require("wizu-8c986-firebase-adminsdk-lzm7d-0ae8528104.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://wizu-8c986.firebaseio.com"
});

const storage = googleStorage({
  projectId: "wizu-8c986",
  keyFilename: "wizu-8c986-firebase-adminsdk-lzm7d-0ae8528104.json"
});

const bucket = storage.bucket("wizu-8c986.appspot.com");

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // no larger than 5mb, you can change as needed.
  }
});

const uploadImageToStorage = file => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No image file");
    }
    let newFileName = `${file.originalname}_${Date.now()}`;

    let fileUpload = bucket.file(newFileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on("error", error => {
      reject("Something is wrong! Unable to upload at the moment.");
    });

    blobStream.on("finish", () => {
      // The public URL can be used to directly access the file via HTTP.
      const url = format(
        `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`
      );
      resolve(url);
    });

    blobStream.end(file.buffer);
  });
};
app.post("/upload", multer.single("file"), (req, res) => {
  console.log("Upload Image");

  let file = req.file;
  if (file) {
    uploadImageToStorage(file)
      .then(success => {
        res.status(200).send({
          status: "success"
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
});

let express = require("express");

const { expose } = utils;

let app = express();
let PORT = 8080;
const db = new DataBase();

app.use(cors());

const response = function(res) {
  responseSent = false;
  res.setHeader("Content-type", "application/json; charset=utf-8");
  return function(code, msg) {
    if (!responseSent) {
      responseSent = true;
      res.statusCode = code;
      console.log(msg);
      res.send({ msg });
    }
  };
};
// support CORS
app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST , OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(bodyParser.json());

// UsersApi
expose(app, UsersApi.getUsers, db);

expose(app, UsersApi.getEventsForUsername, db);

expose(app, UsersApi.removeUser, db);

expose(app, UsersApi.addUser, db);

expose(app, UsersApi.setUserPassword, db);

expose(app, UsersApi.setUserMail, db);

expose(app, UsersApi.setUserFullName, db);

expose(app, UsersApi.login, db);

expose(app, UsersApi.logout, db);

// EVENTS

expose(app, EventsApi.eventSetImage, db);

expose(app, EventsApi.createEvent, db);

expose(app, EventsApi.removeEvent, db);

expose(app, EventsApi.inviteUserToEvent, db);

app.post(
  "/uploadfile",
  cors(),
  fileUpload({
    limits: {
      fileSize: 1024 * 1024 * 1000
    }
  }),
  async function(req, res) {
    console.log("file", req.files.file);
    res.statusCode = 200;
    res.send({ files: req.files });
  }
);

app.post("/event/remove", async function(req, res) {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  const { username, event_id, token } = req.body;
  let credentials = await db.validateToken(username, token);
  if (credentials) {
    await db.eventsApi.removeEvent(event_id, respond);
    respond(200, "success");
  } else {
    respond(401, `user is not authorized`);
  }
});

// ACTION ITEMS

app.post("/event/add/todo_list", async function(req, res) {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  const { username, title, description, event_id, token } = req.body;
  let credentials = await db.validateToken(username, token);
  if (credentials) {
    let id = await db.todolistApi.createList(title, description, respond);
    if (event_id) {
      db.todolistApi.addListToEvent(id, event_id, respond);
    }
    respond(200, id);
  } else {
    respond(401, `user is not authorized`);
  }
});

app.post("/event/todo_lists/action_item/add", async function(req, res) {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  const { list_id, username, descr, have, need, unit, cost, token } = req.body;
  let credentials = await db.validateToken(username, token);
  if (credentials) {
    let id = await db.todolistApi.createItemInList(
      username,
      descr,
      have,
      need,
      unit,
      cost,
      list_id,
      token,
      respond
    );
    respond(200, id);
  } else {
    respond(401, `user is not authorized`);
  }
});

app.post("/event/add/action_item", async function(req, res) {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  const { username, descr, have, need, unit, cost, token } = req.body;
  let credentials = await db.validateToken(username, token);
  if (credentials) {
    let id = await db.actionItemApi.createNewActionItem(
      username,
      descr,
      have,
      need,
      unit,
      cost,
      token,
      respond
    );
    respond(200, id);
  } else {
    respond(401, `user is not authorized`);
  }
});

app.post("/event/add/action_item/row", async function(req, res) {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  const { username, aid, quantity, payed, token } = req.body;
  let credentials = await db.validateToken(username, token);
  if (credentials) {
    let id = await db.actionItemApi.addToActionItem(
      aid,
      username,
      quantity,
      payed,
      token,
      respond
    );
    respond(200, id);
  } else {
    respond(401, `user is not authorized`);
  }
});

// app.post('/event/add/stickeyNote',async function (req, res) {
//   let respond = response(res);
//   const txt = req.body.message;
//   const objectId = req.body.objectId;// todo get it from the event id
//   const title = req.body.title;
//   db.eventsApi.addStickeyNote(objectId,title,txt);
//   //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
//   res.setHeader('Content-type', 'application/json; charset=utf-8');
//   respond(200,'success')
// });

app.post("/event/remove/stickeyNote", async function(req, res) {
  let respond = response(res);
  const stickeyId = req.body.stickey_note;
  const eventId = req.body.event_id; // todo get it from the event id
  db.removeStickeyNoteFromEvent(stickeyId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  respond(200, "success");
});

// app.post("/events/:id/add/:username", async (req, res) => {
//   // res.setHeader("Content-type", "application/json; charset=utf-8");
//   let respond = response(res);
//   try {
//     const { id: event_id, username } = req.params;
//     const [user] = await db.usersApi.getUsers([username], respond); // TODO: same for events
//     if (!user) {
//       return respond(400, `user ${username}, does not exists`);
//     }
//     const res = await Promise.all([
//       db.eventsApi.addUsersToEvent(event_id, [username], respond),
//       db.usersApi.addEventToUsers(event_id, [username], respond)
//     ]);

//     // console.log(req.params);
//     respond(200, res);
//   } catch (err) {
//     console.log(err);
//     respond(400, err.message);
//   }
// });
app.post("/events/:id/remove/:username", async (req, res) => {
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  let respond = response(res);
  try {
    const { id: event_id, username } = req.params;
    const [user] = await db.usersApi.getUsers([username], respond);
    if (!user) {
      return respond(400, `user with the id ${username}, does not exists`);
    } else {
      const res = await Promise.all([
        db.usersApi.removeEventFromUser(event_id, [username]),
        db.eventsApi.removeUsersFromEvent(event_id, [username])
      ]);
      respond(200, res);
    }
    // console.log(req.params);
  } catch (err) {
    console.log(err);
    respond(400, err.message);
  }
});

// app.post("/users/remove/:username", async function(req, res) {
//   let respond = response(res);
//   // res.setHeader("Content-type", "application/json; charset=utf-8");
//   const username = req.params.username;
//   const eventId = req.body.event_id; // todo get it from the event id
//   await db.usersApi.removeUser(username, respond);
//   //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
//   respond(200, "success");
// });

app.post("/event/remove/user", async function(req, res) {
  let respond = response(res);
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  const userId = req.body.username;
  const eventId = req.body.event_id; // todo get it from the event id
  await db.removeUserFromEvent(eventId, userId, respond);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  respond(200, "success");
});

app.post("/event/edit", async function(req, res) {
  let respond = response(res);
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  const title = req.body.title;
  const eventId = req.body.event_id; // todo get it from the event id
  const value = req.body.value;
  await db.updateEventField(title, eventId, value);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  respond(200, "success");
});

app.post("/event/add/administrator", function(req, res) {
  let respond = response(res);
  const userId = req.body.username;
  const eventId = req.body.event_id; // todo get it from the event id
  db.addAdminToEvent(userId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  respond(200, "success");
});

app.post("/event/remove/administrator", function(req, res) {
  let respond = response(res);
  const userId = req.body.username;
  const eventId = req.body.event_id; // todo get it from the event id
  db.removeAdminFromEvent(userId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  // res.setHeader("Content-type", "application/json; charset=utf-8");
  respond(200, "success");
});

app.listen(PORT, () =>
  console.log(`server is up and listening on port ${PORT}!`)
);
