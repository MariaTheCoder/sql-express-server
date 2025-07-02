const db = require("../db");

function authenticateSession(req, res, next) {
  console.log("requested");
  if (!req.query.token) {
    return res.status(401).send("Unauthorized. Please log in.");
  }
  const token = req.query.token;

  const checkSessionStatement = db.prepare(
    "SELECT * FROM Session WHERE Token = ?"
  );
  const session = checkSessionStatement.get(token);

  if (!session) {
    console.log("Session doesn't exist");
    return res.status(401).send("Unauthorized. Please log in.");
  }

  if (session && session.ExpiresAt < Date.now()) {
    const deleteStatement = db.prepare("DELETE FROM Session WHERE Token = ?");
    const info = deleteStatement.run(token);
    console.log("Session expired. ", info);
    return res.status(401).send("Unauthorized. Please log in.");
  }

  next();
}

module.exports = authenticateSession;
