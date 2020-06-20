var mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env['HOST_DB'],
    port: "",
    user: process.env['USER_DB'],
    password: process.env['PASSWORD_DB'],
    database: process.env['DATABASE']
});

module.exports = connection;