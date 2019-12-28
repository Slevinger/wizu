let bodyParser = require('body-parser')
const DataBase = require('./dataBase');
let express = require('express');
let app = express();
let PORT = 8080;
const db = new DataBase();


const response = function (res) {
  responseSent = false;
  return function (code, msg) {
    if (!responseSent) {
      responseSent = true;
      res.statusCode = code;
      res.send(msg)
    }
  }
};
// support CORS
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST , OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(bodyParser.json());

app.post('/users/remove', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id } = req.body;

    let user = await db.usersApi.removeUser(user_id, respond)
    respond(200, `User ${user.fullname.first} ${user.fullname.last}, was deleted`)
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});

app.post('/users/add', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { username, password, email, firstname, lastname } = req.body;
    await db.usersApi.addUser(username, password, email, firstname, lastname, respond)
    respond(200, 'success')
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});


app.post('/users/setpass', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id, old_pass, new_pass, pass_confirm, token } = req.body;
    if (!token) {
      respond(400, 'user is not logged in');
    } else if (new_pass == pass_confirm) {
      await db.usersApi.setPassword(user_id, old_pass, new_pass, token, respond)
    }
    respond(200, 'success')
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});


app.post('/users/setmail', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id, password, new_mail, token } = req.body;
    if (!token) {
      respond(400, 'user is not logged in');
    } else {
      await db.usersApi.setEmail(user_id, password, new_mail, token, respond)
    }
    respond(200, 'success')
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});

app.post('/users/setname', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id, first_name, last_name, token } = req.body;
    if (!token) {
      respond(400, 'user is not logged in');
    } else {
      await db.usersApi.setName(user_id, first_name, last_name, token, respond)
      respond(200, 'success')
    }

  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});

app.post('/users/addsetdetails', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id, detail_key, detail, token } = req.body;
    if (!token) {
      respond(400, 'user is not logged in');
    } else {
      await db.usersApi.addDetails(user_id, detail_key, detail, token, respond)
      respond(200, 'success')
    }

  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});

app.post('/users/logout', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { user_id, token } = req.body;
    await db.usersApi.logout(user_id, token, respond)

    respond(200, 'success')
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});

app.post('/users/login', async function (req, res) {
  try {
    res.setHeader('Content-type', 'application/json; charset=utf-8');
    let respond = response(res);
    const { username, email, password } = req.body;
    let token = await db.usersApi.login(username, email, password, respond)
    respond(200, token);
  }
  catch (err) {
    console.log(err)
    respond(400, err);
  }
});
// EVENTS

app.post('/event/create', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { user_id, name, description, date, location, event_nature, token } = req.body;
  let credentials = await this.validateToken(user_id, token);
  if (credentials) {
    let eventId = await db.eventsApi.createEvent(name, description, date, location, event_nature)
    respond(200, eventId)
  } else {
    respond(401, `user is not authorized`)
  }
});

app.post('/event/remove', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { user_id, event_id, token } = req.body;
  let credentials = await this.validateToken(user_id, token);
  if (credentials) {
    await db.eventsApi.removeEvent(event_id, respond);
    respond(200, 'success')
  } else {
    respond(401, `user is not authorized`)
  }
});


// ACTION ITEMS

app.post('/event/add/todo_list', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { user_id, title, description, event_id, token } = req.body;
  let credentials = await this.validateToken(user_id, token);
  if (credentials) {
    let id = await db.todolistApi.createList(title, description, respond);
    if (event_id) {
      db.todolistApi.addListToEvent(id, event_id, respond);
    }
    respond(200, id)
  } else {
    respond(401, `user is not authorized`)
  }
});

app.post('/event/todo_lists/action_item/add', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { list_id, user_id, descr, have, need, unit, cost, token } = req.body;
  let credentials = await db.validateToken(user_id, token);
  if (credentials) {
    let id = await db.todolistApi.createItemInList(user_id, descr, have, need, unit, cost, list_id, token, respond)
    respond(200, id)
  } else {
    respond(401, `user is not authorized`)
  }
});


app.post('/event/add/action_item', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { user_id, descr, have, need, unit, cost, token } = req.body;
  let credentials = await db.validateToken(user_id, token);
  if (credentials) {
    let id = await db.actionItemApi.createNewActionItem(user_id, descr, have, need, unit, cost, token, respond)
    respond(200, id)
  } else {
    respond(401, `user is not authorized`)
  }
});

app.post('/event/add/action_item/row', async function (req, res) {
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  let respond = response(res);
  const { user_id, aid, quantity, payed, token } = req.body;
  let credentials = await db.validateToken(user_id, token);
  if (credentials) {
    let id = await db.actionItemApi.addToActionItem(aid, user_id, quantity, payed, token, respond)
    respond(200, id)
  } else {
    respond(401, `user is not authorized`)
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

app.post('/event/remove/stickeyNote', async function (req, res) {
  let respond = response(res);
  const stickeyId = req.body.stickey_note;
  const eventId = req.body.event_id;// todo get it from the event id 
  db.removeStickeyNoteFromEvent(stickeyId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  respond(200, 'success')
});


app.post('/event/add/user', async function (req, res) {
  let respond = response(res);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  const userId = req.body.user_id;
  const eventId = req.body.event_id;// todo get it from the event id 
  await db.addUserToEvent(eventId, userId, respond);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  respond(200, 'success')
});

app.post('/event/remove/user', async function (req, res) {
  let respond = response(res);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  const userId = req.body.user_id;
  const eventId = req.body.event_id;// todo get it from the event id 
  await db.removeUserFromEvent(eventId, userId, respond);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  respond(200, 'success')
});

app.post('/event/edit', async function (req, res) {
  let respond = response(res);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  const title = req.body.title;
  const eventId = req.body.event_id;// todo get it from the event id 
  const value = req.body.value;
  await db.updateEventField(title, eventId, value);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  respond(200, 'success')
});



app.post('/event/add/administrator', function (req, res) {
  let respond = response(res);
  const userId = req.body.user_id;
  const eventId = req.body.event_id;// todo get it from the event id 
  db.addAdminToEvent(userId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  respond(200, 'success')
});

app.post('/event/remove/administrator', function (req, res) {
  let respond = response(res);
  const userId = req.body.user_id;
  const eventId = req.body.event_id;// todo get it from the event id 
  db.removeAdminFromEvent(userId, eventId);
  //let response = helper.guessKey(JSON.parse(textToDecrypt), keySize);
  res.setHeader('Content-type', 'application/json; charset=utf-8');
  respond(200, 'success')
});



app.listen(PORT, () => console.log(`server is up and listening on port ${PORT}!`));