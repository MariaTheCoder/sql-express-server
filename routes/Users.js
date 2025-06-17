const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/", (req, res) => {
  const rawData = db.prepare("SELECT * FROM User").all();

  res.json(rawData);
});

router.post("/", (req, res) => {
  const email = req.body["Email"];
  const password = req.body["Password"];
  const givenName = req.body["GivenName"];
  const role = req.body["Role"];

  const insertStatement = db.prepare(
    "INSERT INTO User (Email, Password, GivenName, Role) VALUES (?, ?, ?, ?)"
  );

  const info = insertStatement.run(email, password, givenName, role);
  res.json(info);
});

router.post("/register", (req, res) => {
  const email = req.body["Email"];
  const password = req.body["Password"];

  const insertStatement = db.prepare(
    "INSERT INTO User (Email, Password) VALUES (?, ?)"
  );

  const info = insertStatement.run(email, password);
  res.json(info);
});

router.get("/login", (req, res) => {
  const email = req.body["Email"];
  const password = req.body["Password"];

  // first we need to find out if the user exists
  const statement = db
    .prepare("SELECT * FROM User WHERE Email = ? AND Password = ?")
    .bind(email, password);
  const user = statement.get();

  // login new user. For now, alternate whether the login was successful or not
  if (!user) {
    res.sendStatus(401);
    return;
  }

  res.status(200).json(user);
});

router.get("/logout", (req, res) => {
  const email = req.body["Email"];

  // first we need to find out if the user exists
  const statement = db
    .prepare("SELECT * FROM User WHERE Email = ?")
    .bind(email);
  const user = statement.get();

  // if the user was not found, send back an http error
  if (!user) {
    res.sendStatus(401);
    return;
  }

  res.status(200).json(user);
});

module.exports = router;
