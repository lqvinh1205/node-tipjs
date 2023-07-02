const express = require("express");
const route = express.Router();

route.get("/", (req, res) => {
  res.send("This is home page");
});

module.exports = route;
