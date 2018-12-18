const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.static(path.join(__dirname + "/app")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

let activeUsers = [];
let writeLockOwner = "";
let doc = "";

io.on("connection", function (socket) {
  console.log("a user connected");
  socket.on('release', function (data) {
    writeLockOwner = '';
    console.log(data.user, 'has released locak');
    io.emit("released");
  });

  socket.on("newdata", function (data) {
    console.log("new data arrived", data.data);
    doc = data.data;
    io.emit('newContent', {
      data: doc,
      author: writeLockOwner
    });
  });
});

app.post("/adduser", function (req, res) {
  let username = req.body.username;
  if (activeUsers.indexOf(username) < 0) {
    activeUsers.push(username);
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});

app.post("/addcontent", function (req, res) {
  let data = req.body.content;
  doc += data;
  console.log("new data added");
  res.sendStatus(200);
  io.emit('dataChange', {
    data: doc
  });
});

app.post("/release", function (req, res) {
  writeLockOwner = "";
  console.log(req.body.user, "has released lock");
  res.sendStatus(200);
  io.emit("released", {});
});

app.get("/getdata", function (req, res) {
  res.send({
    content: doc
  });
});

app.get("/requestlock", function (req, res) {
  let requester = req.query.name;
  if (writeLockOwner === "") {
    writeLockOwner = requester;
    res.send("granted");
    io.emit("lockgranted", {
      user: writeLockOwner
    });
  } else {
    res.send(writeLockOwner);
  }
});

app.set("port", process.env.PORT || 5000);

http.listen(app.get("port"), function () {
  console.log("Node app is running on port", app.get("port"));
});