const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const env = require('node-env-file');
env(__dirname + '/.env');

app.use(cors());
app.use(bodyParser.json());

require("./routes/apis/register")(app);
require("./routes/apis/transactions")(app);
require("./routes/pages")(app);

app.listen(process.env.PORT || 5000);
