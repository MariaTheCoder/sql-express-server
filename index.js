const Database = require("better-sqlite3");
const express = require("express");

// load data base
const db = new Database("Chinook_Sqlite.sqlite");

// create express server
const app = express();
const port = 3000;

app.use(express.json());
// app.use(auth);

app.get("/api/v1", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/v1/artists", (req, res) => {
  const sqlQuery =
    "SELECT Artist.ArtistId, Artist.Name, Album.AlbumId, Album.Title FROM Artist LEFT JOIN Album ON Artist.ArtistId = Album.ArtistId";

  const rawData = db.prepare(sqlQuery).all();

  // time to manipulate the raw data. Let's group by artist
  const result = [];

  const artistMap = {};

  rawData.forEach((artist) => {
    if (!artistMap[artist.Name]) {
      artistMap[artist.Name] = [];

      artistMap[artist.Name].push({
        Title: artist.Title,
      });
    } else {
      artistMap[artist.Name].push({
        Title: artist.Title,
      });
    }
  });

  for (const artistName in artistMap) {
    if (Object.prototype.hasOwnProperty.call(artistMap, artistName)) {
      const albums = artistMap[artistName];

      result.push({
        Name: artistName,
        Albums: albums,
      });
    }
  }

  res.json(result);
});

app.get("/api/v1/artists/:id", (req, res) => {
  const id = req.params.id;

  const info = db.prepare("SELECT * FROM Artist WHERE ArtistId = ?").get(id);

  if (!info) {
    res.status(404).send("Artist does not exist");
    return;
  }

  res.json(db.prepare("SELECT * FROM Artist WHERE ArtistId = ?").get(id));
});

app.get("/api/v1/employees", auth, (req, res) => {
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

app.get("/api/v1/employees/:id", (req, res) => {
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

function auth(req, res, next) {
  const allowedAPI_KEYS = ["maria"];
  const key = req.query.API_KEY;

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
