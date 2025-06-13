const express = require("express");

module.exports = function (db) {
  const router = express.Router();

  router.get("/", (req, res) => {
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

  router.get("/:id", (req, res) => {
    const id = req.params.id;

    const info = db.prepare("SELECT * FROM Artist WHERE ArtistId = ?").get(id);

    if (!info) {
      res.status(404).send("Artist does not exist");
      return;
    }

    res.json(db.prepare("SELECT * FROM Artist WHERE ArtistId = ?").get(id));
  });

  return router;
};
