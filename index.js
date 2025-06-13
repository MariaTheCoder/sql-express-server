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

// User routers
app.use("/api/v1/employees", employeesRouter);

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
