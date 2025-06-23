const express = require("express");
const cors = require("cors");

// Initialize Express app
const app = express();
const port = 3000;

// Use JSON middleware
app.use(express.json());
app.use(cors());

// Import and initialize routers with 'db'
const employeesRouter = require("./routes/employees");
const artistsRouter = require("./routes/Artists");
const usersRouter = require("./routes/Users");

// User routers
app.use("/api/v1/employees", employeesRouter);
app.use("/api/v1/artists", artistsRouter);
app.use("/api/v1/users", usersRouter);

app.get("/api/v1", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
