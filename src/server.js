const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
require("dotenv").config();
const logEvents = require("./Helpers/logEvent");

//Import router
const UserRouter = require("./Routes/users.router");
const AuthRouter = require("./Routes/auth.router");

//Middleware
const { checkToken } = require("./Middlewares/token");

const app = express();

app.use(morgan("tiny"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/v1", AuthRouter);
app.use("/v1/users", checkToken, UserRouter);

app.use((req, res, next) => {
  // res.status(404).json({
  //   status: 404,
  //   message: "Not found",
  // });
  next(createHttpError(404, "Not found"));
});

app.use((err, req, res, next) => {
  logEvents(`${req.url} --- ${req.method} --- ${err.message}`);
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
  });
});

mongoose
  .connect("mongodb://127.0.0.1:27017/tipjs")
  .then(() => console.log("Database connect success"))
  .catch((err) => console.log("Database connect faild"));

mongoose.connection.on("connected", () => console.log("Mongoose connected"));
mongoose.connection.on("error", (err) => console.log(err.message));
mongoose.connection.on("disconnected", () =>
  console.log("Mongoose disconnected")
);

// Bắt sự kiện disconnect
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running port", PORT);
});
