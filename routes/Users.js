const express = require("express");
const path = require("path");
const db = require("../db");
const router = express.Router();
const { randomBytes } = require("node:crypto");

function tokenGenerate(length = 4) {
  return Buffer.from(randomBytes(length)).toString("hex");
}

function requireAuth(req, res, next) {
  console.log("requested");
  if (!req.query.token) {
    return res.status(401).send("Unauthorized. Please log in.");
  }
  const token = req.query.token;

  const checkSessionStatement = db.prepare(
    "SELECT * FROM Session WHERE Token = ?"
  );
  const session = checkSessionStatement.get(token);

  console.log(session);

  if (!session) {
    console.log("Session doesn't exist");
    return res.status(401).send("Unauthorized. Please log in.");
  }

  if (session || session.ExpiresAt < Date.now()) {
    const deleteStatement = db.prepare("DELETE FROM Session WHERE Token = ?");
    const info = deleteStatement.run(token);
    console.log("Session expired. ", info);
    return res.status(401).send("Unauthorized. Please log in.");
  }

  next();
}

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

  // Step 1: Test is user already exists in the database
  const checkUserStatement = db.prepare("SELECT * FROM User WHERE Email = ?");
  const existingUser = checkUserStatement.get(email);

  // Step 2: If user does not already exist in the database, add user
  if (!existingUser) {
    const insertStatement = db.prepare("INSERT INTO User (Email) VALUES (?)");

    const info = insertStatement.run(email);
    const newUserId = info.lastInsertRowid;

    const newUserStatement = db.prepare("SELECT * FROM User WHERE UserId = ?");
    const newUser = newUserStatement.get(newUserId);

    res.status(201).json(newUser);
  } else {
    const insertStatement = db.prepare(
      "INSERT INTO Session (UserId, Token, ExpiresAt) VALUES (?, ?, ?)"
    );
    const { UserId } = existingUser;
    const newToken = tokenGenerate();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

    const info = insertStatement.run(UserId, newToken, expiresAt);

    console.log(info);

    res.status(200).json({
      existingUser,
      newToken,
    });
  }
});

router.get("/dashboard", requireAuth, (req, res) => {
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
