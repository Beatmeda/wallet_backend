const connect = require("../servers/connection");

module.exports = {
    create: function(table, params, callback) {
        let string = "";
        let values = "";
        for (let index in params) {
            string += `${index},`;
            values += `'${params[index]}',`;
        }
        string = string.slice(0, -1);
        values = values.slice(0, -1);

        let sql = `INSERT INTO ${table} (${string}) VALUES(${values})`;
        connect.query(sql, function(err, response) {
            if (err)
                return callback({ message: "Algo salió mal: " + err, status: 500 });
            return callback({ message: "Registro exitoso", status: 200 });
        });
    },

    query: function(sql, callback) {
        connect.query(sql, function(err, response) {
            if (err)
                return callback({
                    message: "Algo salió mal: " + err,
                    status: 500
                });
            return callback({ message: response, status: 200 });
        });
    },

    get: function(table, callback) {
        let sql = `SELECT * FROM ${table}`;
        connect.query(sql, function(err, response) {
            if (err)
                return callback({
                    message: "Algo salió mal: " + err,
                    status: 500
                });
            return callback({ message: response, status: 200 });
        });
    },
};