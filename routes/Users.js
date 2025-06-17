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

let success = true;

router.get("/login", (req, res) => {
  // login new user. For now, alternate whether the login was successful or not
  if (!success) {
    success = !success;
    res.sendStatus(401);
    return;
  } else {
    success = !success;
    res.sendStatus(200);
    return;
  }
});

module.exports = router;
