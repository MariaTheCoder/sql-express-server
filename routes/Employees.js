const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  router.get("/", auth, (req, res) => {
    const allowedQueryParams = [
      "LastName",
      "FirstName",
      "Title",
      "ReportsTo",
      "Address",
      "City",
      "State",
      "Country",
    ];
    const sqlQuery = "SELECT * FROM Employee";
    const queryParts = [];
    const placeHolderValues = [];
    let employees = [];

    console.log("employee", req.query);

    for (const qp in req.query) {
      if (allowedQueryParams.includes(qp)) {
        queryParts.push(`${qp} = ?`);
        placeHolderValues.push(req.query[qp]);
      }
    }

    if (queryParts.length > 0) {
      employees = db
        .prepare(sqlQuery + " WHERE " + queryParts.join(" AND "))
        .all(placeHolderValues);
    } else {
      employees = db.prepare(sqlQuery).all();
    }

    // if (title) {
    //   queryParts.push("Title = ?");
    //   placeHolderValues.push(title);
    // }

    // if (lastName) {
    //   queryParts.push("LastName = ?");
    //   placeHolderValues.push(lastName);
    // }

    // if (city) {
    //   queryParts.push("City = ?");
    //   placeHolderValues.push(city);
    // }

    // if (title || lastName || city) {
    //   sqlQuery += " WHERE " + queryParts.join(" AND ");
    //   console.log(sqlQuery);
    //   employees = db.prepare(sqlQuery).all(placeHolderValues);
    // } else {
    //   employees = db.prepare(sqlQuery).all();
    // }

    res.json(employees);
  });

  router.get("/:id", (req, res) => {
    const id = req.params.id;

    const info = db
      .prepare("SELECT * FROM Employee WHERE EmployeeId = ?")
      .get(id);

    if (!info) {
      res.status(404).send("Employee does not exist");
      return;
    }

    res.json(db.prepare("SELECT * FROM Employee WHERE EmployeeId = ?").get(id));
  });

  router.post("/", (req, res) => {
    const firstName = req.body["FirstName"];
    const lastName = req.body["LastName"];

    const insertStatement = db.prepare(
      "INSERT INTO Employee (LastName, FirstName) VALUES (?, ?)"
    );

    const info = insertStatement.run(lastName, firstName);
    const newEmployeeId = info.lastInsertRowid;

    res.json(
      db
        .prepare("SELECT * FROM Employee WHERE EmployeeId = ?")
        .get(newEmployeeId)
    );
  });

  router.put("/:id", (req, res) => {
    const id = req.params.id;
    const firstName = req.body["FirstName"];

    const updateStatement = db.prepare(
      "UPDATE Employee SET FirstName = ? WHERE EmployeeId = ?"
    );

    updateStatement.run(firstName, id);

    res.json(db.prepare("SELECT * FROM Employee WHERE EmployeeId = ?").get(id));
  });

  router.delete("/:id", (req, res) => {
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

  function auth(req, res, next) {
    const allowedAPI_KEYS = ["maria"];
    const key = req.query.API_KEY;

    console.log("auth", req.query);

    if (!key) {
      res.sendStatus(403);
      return;
    }

    if (!allowedAPI_KEYS.includes(key)) {
      res.sendStatus(401);
      return;
    }

    if (allowedAPI_KEYS.includes(key)) {
      next();
      return;
    }
  }

  return router;
};
