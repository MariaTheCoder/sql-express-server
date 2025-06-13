const express = require("express");
const Database = require("better-sqlite3");

// Initialize the database
const db = new Database("Chinook_Sqlite.sqlite");

// Initialize Express app
const app = express();
const port = 3000;

// Use JSON middleware
app.use(express.json());

// Import and initialize routers with 'db'
const employeesRouter = require("./routes/employees")(db);
const artistsRouter = require("./routes/Artists")(db);

// User routers
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/artists", artistsRouter);

app.get("/api/v1", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
