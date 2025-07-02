const express = require("express");
const cors = require("cors");
const session = require("express-session");

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Use JSON middleware
app.use(express.json());
app.use(cors());
app.use(
  session({
    secret: "your-secret-key", // replace this with a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 hour
    },
  })
);

// Import and initialize routers with 'db'
const employeesRouter = require("./routes/employees");
const artistsRouter = require("./routes/Artists");
const usersRouter = require("./routes/Users");

// Use express.static middleware to serve static files from the "public" folder
app.use(express.static("public"));

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
