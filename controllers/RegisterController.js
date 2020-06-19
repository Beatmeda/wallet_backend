const database = require("../models/database");
let validator = require('validatorjs');

module.exports = {
    register: function (req, callback) {
        let rules = {
            document: 'required',
            full_name: 'required',
            email: 'required|email',
            phone: 'required|numeric',
        }
        let result = new validator(req, rules);
        if (result.passes()) {
            database.query(`SELECT id FROM users WHERE document = '${req.document}' or email = '${req.email}'`, function (response) {
                if(response.status == 200){
                    if (response.message.length > 0) {
                        return callback({
                            "message": "El usuario que quieres registrar ya existe.",
                            "status": 422
                        });
                    }
                    database.create('users', req, function (response) {
                        return callback({
                            'message': response.message,
                            'status': response.status
                        });
                    });
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
                'status': 422
            });
        }
    },
};