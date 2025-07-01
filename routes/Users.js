const express = require("express");
const path = require("path");
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

  // Step 1: Check if user already exists
  const checkUserStatement = db.prepare("SELECT * FROM User WHERE Email = ?");
  const existingUser = checkUserStatement.get(email);

  if (existingUser) {
    // Email already exists
    res.status(409).json({ message: "User with this email already exists." });
    return;
  }

  // Step 2: Insert new user
  const insertStatement = db.prepare(
    "INSERT INTO User (Email, Password) VALUES (?, ?)"
  );

  const info = insertStatement.run(email, password);
  console.log(info);
  res.status(201).json(info);
});

router.post("/login", (req, res) => {
  const email = req.body["Email"];
  const password = req.body["Password"];

  // first we need to find out if the user exists
  const statement = db.prepare(
    "SELECT * FROM User WHERE Email = ? AND Password = ?"
  );
  const user = statement.get(email, password);

  // login new user. For now, alternate whether the login was successful or not
  if (!user) {
    res.sendStatus(401);
    return;
  }

  // redirect to the dashboard route
  res.redirect("http://127.0.0.1:3000/api/v1/users/dashboard");
});

router.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../private", "dashboard.html"));
});

router.get("/logout", (req, res) => {
  const email = req.body["Email"];

  // first we need to find out if the user exists
  const statement = db.prepare("SELECT * FROM User WHERE Email = ?");
  const user = statement.get(email);

  // if the user was not found, send back an http error
  if (!user) {
    res.sendStatus(401);
    return;
  }

  res.status(200).json(user);
});

module.exports = router;
