const express = require("express");
const app = express();

app.get("/", (req, res) => {
  const message = process.env.MESSAGE || "Good Day!";
  res.send(`Welcome to Serverless Meetup @ DELLEMC! - ${message}!`);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log("Hello world listening on port", port);
});
