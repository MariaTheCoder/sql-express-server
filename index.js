const Database = require("better-sqlite3");
const express = require("express");

// load data base
const db = new Database("Chinook_Sqlite.sqlite");

// create express server
const app = express();
const port = 3000;

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/v1/employees", (req, res) => {
  res.json(db.prepare("SELECT * FROM Employee").all());
});

app.get("/api/v1/employees/:id", (req, res) => {
  const id = req.params.id;
  res.json(db.prepare("SELECT * FROM Employee WHERE EmployeeId = ?").get(id));
});

app.post("/api/v1/employees", (req, res) => {
  const firstName = req.body["FirstName"];
  const lastName = req.body["LastName"];

  const insertStatement = db.prepare(
    "INSERT INTO Employee (LastName, FirstName) VALUES (?, ?)"
  );

  const info = insertStatement.run(lastName, firstName);
  const newEmployeeId = info.lastInsertRowid;

  res.json(
    db.prepare("SELECT * FROM Employee WHERE EmployeeId = ?").get(newEmployeeId)
  );
});

app.put("/api/v1/employees/:id", (req, res) => {
  const id = req.params.id;
  const firstName = req.body["FirstName"];

  const updateStatement = db.prepare(
    "UPDATE Employee SET FirstName = ? WHERE EmployeeId = ?"
  );

  updateStatement.run(firstName, id);

  res.json(db.prepare("SELECT * FROM Employee WHERE EmployeeId = ?").get(id));
});

app.delete("/api/v1/employees/:id", (req, res) => {
  const id = req.params.id;
  const employeeToBeDeleted = db
    .prepare("SELECT * FROM Employee WHERE EmployeeId = ?")
    .get(id);

  const deleteStatement = db.prepare(
    "DELETE FROM Employee WHERE EmployeeId = ?"
  );

  deleteStatement.run(id);

  res.json(employeeToBeDeleted);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
