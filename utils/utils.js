const database = require("../models/database");
module.exports = {
    validate_user: function (req, callback) {
        database.query(`SELECT * FROM users u WHERE u.document = '${req.document}' AND u.phone = '${req.phone}'`, function (response) {
            if(response.status == 200){
                if(response.message.length < 1) {
                    return callback({
                        'message': "No existe un usuario con el documento " + req.document + " y celular " + req.phone + ". ¿Qué esperas para registrarte?",
                        'status': 422,
                    });
                }else {
                    return callback({
                        'message': {user_id: response.message[0].id, email: response.message[0].email},
                        'status': 200,
                    });
                }
            }else{
                return callback({
                    'message': response.message,
                    'status': response.status
                });
            }
        });
    },
    validate_balance: function (user_id, callback) {
        database.query(`SELECT SUM(t.value) as balance FROM transactions t WHERE t.user_id = '${user_id}'`, function (response) {
            return callback({
                'message': response.message[0].balance,
                'status': response.status
            });
        });
    },
    update_user_token: function (user_id, token, callback) {
        database.query(`UPDATE users SET token = '${token}' WHERE id = '${user_id}'`, function (response) {
            return callback({
                'message': response,
                'status': response.status
            });
        });
    },
};