require("dotenv").config();
var express = require("express");
var app = express();
var formidable = require("express-formidable");

require("./database");
app.use(formidable());

require("./cheeses.route")(app);

app.listen(process.env.PORT || 3000, () => {
    console.log("App is running on port", process.env.PORT || 3000);
});