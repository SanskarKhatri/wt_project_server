const express = require("express");
const bcrypt = require("bcrypt");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const Routes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;

let userLoggedin = "";
 
Routes.route("/check").get(function (req, res) {
  let myobj = {user: userLoggedin};
  res.json(myobj);
 });

//LOGIN
Routes.route("/auth").post(async function (req,res){
  let db_connect = dbo.getDb();
  let user = {username: req.body.username};
  db_connect.collection("Users").findOne(user,async function(err,User){
    if(err){
      console.log(err);
    }
  if(User){
    const validate = await bcrypt.compare(req.body.password, User.password);
    if(validate){
      const {password, ...others} = User;
      res.status(200).json(others);
      userLoggedin = others.username;
    } else {
      res.status(400).json("Wrong password!");
    }
  } else {
    res.status(400).json("Wrong Username!");
  }
  });

})

 //REGISTRATION
Routes.route("/register").post(async function(req,response){
  let db_connect = dbo.getDb();
  const salt = await bcrypt.genSalt(10);
  const hashedPass = await bcrypt.hash(req.body.password, salt);
  let user = {
    username: req.body.username,
    email: req.body.email,
    password: hashedPass
  };
  db_connect.collection("Users").insertOne(user, function (err, res) {
    if (err) throw err;
    response.json(res);
    userLoggedin = req.body.username;
  });
})


// This section will help you get a array of all the Lists int workspace.
Routes.route("/:user").get(function (req, res) {
 let db_connect = dbo.getDb();
 db_connect
   .collection(req.params.user)
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
Routes.route("/:user/:id").get(function (req, res) {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect
    .collection(req.params.user)
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
 });
 
// This section will help you create a new List.
Routes.route("/user/addList").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myobj = {
   name: req.body.name
 };
 db_connect.collection(req.body.user).insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});

Routes.route("/user/addCard").post(function (req, response) {
  let db_connect = dbo.getDb();
  let currentCards = req.body.currentCards;
  let myobj = {
    key: req.body.key,
    content : req.body.content
  };
  let myquery = { _id: ObjectId(req.body.id) };
  db_connect.collection(req.body.user).updateOne(myquery, {$set: {cards: [...currentCards, myobj]}}, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
 });

Routes.route("/:user/deleteList/:id").delete((req, response) => {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection(req.params.user).deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  });
 });
 
 Routes.route("/:user/deleteCard/:id/:key").delete((req, response) => {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  let key = req.params.key;
  db_connect
    .collection(req.params.user)
    .find(myquery)
    .toArray(function (err, result) {
      if (err) throw err;
      const cards = result[0].cards;
      const newCards = cards.filter((card) => (card.key !== key));
      db_connect.collection(req.params.user).updateOne(myquery, {$set: {cards: newCards}}, function (err, res) {
        if (err) throw err;
        console.log("1 card deleted.");
        response.json(res);
      });
    });
 });

module.exports = Routes;