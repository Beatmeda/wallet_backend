const database = require("../models/database");
let validator = require("validatorjs");

module.exports = {
    chargeMoney: function (req, callback) {
        let rules = {
            document: 'required',
            phone: 'required',
            type: 'required',
            value: 'required|numeric',
        }
        let result = new validator(req, rules);
        if (result.passes()) {
            database.query(`SELECT * FROM users u WHERE u.document = '${req.document}' AND u.phone = '${req.phone}'`, function (response) {
                if(response.status == 200){
                    if(response.message.length < 1) {
                        return callback({
                            'message': "No existe un usuario con el documento " + req.document + " y celular " + req.phone + ". ¿Qué esperas para registrarte?",
                            'status': 422
                        });
                    }else {
                        let body = {
                            user_id: response.message[0].id,
                            value: req.value,
                            type: req.type
                        }
                        database.create('transactions', body,  function (response_transaction)  {
                            if(response_transaction.status == 200){
                                return callback({
                                    'message': 'Recarga exitosa.',
                                    'status': response_transaction.status
                                });
                            } else {
                                return callback({
                                    'message': response_transaction.message,
                                    'status': response_transaction.status
                                });
                            }
                        });
                    }
                }else{
                    return callback({
                        'message': response.message,
                        'status': response.status
                    });
                }
            });
        } else {
            return callback({
                'message': result.errors.errors,
                'status': 200
            });
        }
    },
};