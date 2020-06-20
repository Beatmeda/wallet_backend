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
        database.query(`SELECT SUM(t.value) as balance FROM transactions t WHERE t.user_id = '${user_id}' AND t.enabled = '1'`, function (response) {
            return callback({
                'message': (response.message[0].balance) ? response.message[0].balance : 0,
                'status': response.status
            });
        });
    },
    validate_token_confirmation: function (user_id, token, callback) {
        database.query(`SELECT * FROM transactions t WHERE t.user_id = '${user_id}' AND t.token = '${token}' AND enabled = '0'`, function (response) {
            if(response.status == 200){
                if(response.message.length < 1) {
                    return callback({
                        'message': "No existe una compra por aprobar con el token enviado.",
                        'status': 422,
                    });
                }else {
                    return callback({
                        'message': response.message[0].value,
                        'status': 200
                    });
                }
            }else{
                return callback({
                    'message': "No existe una compra por aprobar con el token enviado.",
                    'status': 422
                });
            }
        });
    },
    update_transaction_enabled: function (token, callback) {
        database.query(`UPDATE transactions SET enabled = '1' WHERE token = '${token}'`, function (response_update_enabled) {
            if(response_update_enabled.status == 200) {
                return callback({
                    'message': "Su compra ha sido aprobada.",
                    'status': 200,
                });
            }else {
                return callback({
                    'message': "No fue posible descontar el dinero de la billetera.",
                    'status': 422,
                });
            }
        });
    },
};