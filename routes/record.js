const express = require("express");
 
// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();
 
// This will help us connect to the database
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a array of all the Lists int workspace.
recordRoutes.route("/record").get(function (req, res) {
 let db_connect = dbo.getDb();
 db_connect
   .collection("Lists")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you create a new List.
recordRoutes.route("/record/addList").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myobj = {
   name: req.body.name
 };
 db_connect.collection("Lists").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});

recordRoutes.route("/:id").delete((req, response) => {
  let db_connect = dbo.getDb();
  let myquery = { _id: ObjectId(req.params.id) };
  db_connect.collection("Lists").deleteOne(myquery, function (err, obj) {
    if (err) throw err;
    console.log("1 document deleted");
    response.json(obj);
  });
 });
 
module.exports = recordRoutes;