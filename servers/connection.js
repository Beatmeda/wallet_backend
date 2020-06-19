var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    port: "",
    user: "root",
    password: "1234",
    database: "wallet"
});

module.exports = connection;