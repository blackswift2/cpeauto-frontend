const express = require("express");
const path = require("path");

const app = express();
const port = process.env.PORT || 8080;
// Serve only the static files form the dist directory
app.use(express.static(__dirname + "/dist/cpeauto"));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/cpeauto/index.html"));
});

// Start the app by listening on the default Heroku port
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
