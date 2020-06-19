const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());

require("./routes/pages")(app);
require("./routes/apis/register")(app);

app.listen(process.env.PORT || 5000);
