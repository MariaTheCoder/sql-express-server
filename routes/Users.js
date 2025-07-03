const express = require("express");
const path = require("path");
const db = require("../db");
const router = express.Router();
const { randomBytes } = require("node:crypto");
const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "ashton54@ethereal.email",
    pass: "eV7p49qTFCV8NDUw6c",
  },
});

async function sendEmail(token) {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "ashton54@ethereal.email",
    subject: "You sign to Dashboard",
    // text: "", // plain‑text body
    html: `<h1>Your sign in link</h1><p>This link will only be valid for 24 hours</p><a href="http://127.0.0.1:3000/dashboard?token=${token}"  target="_blank" rel="noopener noreferrer">Log in</a>`, // HTML body
  });

  console.log("Message sent:", info.messageId);
}

function tokenGenerate(length = 4) {
  return Buffer.from(randomBytes(length)).toString("hex");
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
  let user;

  // Step 1: Test is user already exists in the database
  const checkUserStatement = db.prepare("SELECT * FROM User WHERE Email = ?");
  user = checkUserStatement.get(email);

  // Step 2: If user does not already exist in the database, add user
  if (!user) {
    const insertStatement = db.prepare("INSERT INTO User (Email) VALUES (?)");

    const info = insertStatement.run(email);
    const newUserId = info.lastInsertRowid;

    const newUserStatement = db.prepare("SELECT * FROM User WHERE UserId = ?");
    user = newUserStatement.get(newUserId);
  }

  // if user exists, start a new session
  const insertStatement = db.prepare(
    "INSERT INTO Session (UserId, Token, ExpiresAt) VALUES (?, ?, ?)"
  );
  const { UserId } = user;
  const newToken = tokenGenerate();
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;

  insertStatement.run(UserId, newToken, expiresAt);

  sendEmail(newToken);

  res.status(200).json({
    ...user,
    newToken,
  });
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
