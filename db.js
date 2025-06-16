const Database = require("better-sqlite3");

let db;

if (!db) {
  db = new Database("Chinook_Sqlite.sqlite");
}

module.exports = db;
