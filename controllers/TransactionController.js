const database = require("../models/database");
let validator = require("validatorjs");
let utils = require("../utils/utils");
const email = require('../utils/email');
const EmailTemplate  = require('email-templates').EmailTemplate;
let path = require('path');

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
            utils.validate_user(req,function(data) {
                if(data.status == 200) {
                    let body = {
                        user_id: data.message.user_id,
                        value: req.value,
                        type: req.type,
                        enabled: 1
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
                }else {
                    return callback({
                        'message': data.message,
                        'status': 422
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
    purchase: function (req, callback) {
        let rules = {
            document: 'required',
            phone: 'required',
            type: 'required',
            value: 'required|numeric',
        }
        let result = new validator(req, rules);
        if (result.passes()) {
            utils.validate_user(req,function(data) {
                if(data.status == 200) {
                    //se valida el balance en dos partes: Aqui es la primera, y se hace para que no envíe correo si la compra es superior al dinero que tenga el usuario.
                    utils.validate_balance(data.message.user_id,function (response_validate_balance) {
                        if(req.value > response_validate_balance.message) {
                            return callback({
                                'message': "La billetera no tiene saldo suficiente para hacer la compra.",
                                'status': 422
                            });
                        }else {
                            let token = Math.random().toString(24).slice(8);//Se genera un token aleatorio con 6 digitos
                            let body = {
                                user_id: data.message.user_id,
                                value: req.value * -1,
                                type: req.type,
                                enabled: 0,
                                token: token
                            }
                            database.create('transactions', body,  async function (response_transaction)  {
                                if(response_transaction.status == 200){
                                    let templatesDir = path.resolve(__dirname, '../utils/templates');
                                    const result =  await email.transporter();
                                    let template = new EmailTemplate(path.join(templatesDir, 'email_confirmation_purchase'));
                                    let params = {
                                        "from": process.env['USER_EMAIL'],
                                        "to": data.message.email,
                                        "subject": 'Confirmación de compra: Correo de prueba',
                                        "token": token + "-" + data.message.user_id,//el token enviado al correo es el token de seis digitos aleatorio y se le añade un digo que es el user_id
                                        "url": process.env['URL']
                                    }

                                    template.render(params, function(err, results) {
                                        if (err) {
                                            return console.error(err);
                                        }

                                        result.sendMail(
                                            {
                                                from: params.from,
                                                to:  params.to,
                                                subject:  params.subject,
                                                html: results.html
                                            }, function (error, info) {
                                                if (error) {
                                                    callback(error.message);
                                                } else {
                                                    callback({
                                                        'message': 'Acabamos de enviar un correo de confirmación de la compra, por favor revisa tu email.',
                                                        'status': 200
                                                    });
                                                }
                                            });
                                    });
                                }else {
                                    return callback({
                                        'message': response_transaction.message,
                                        'status': response_transaction.status
                                    });
                                }
                            });
                        }

                    });
                }else {
                    return callback({
                        'message': data.message,
                        'status': 422
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
    confirmationPurchase: function (req, callback) {
        let token = req.params.token.split("-");
        utils.validate_token_confirmation(token[1],token[0], function (response_validate_token_confirmation) {
            return callback({
                'message': response_validate_token_confirmation.message,
                'status': response_validate_token_confirmation.status
            });
        })
    },
    getBalance: function (req, callback) {
        let rules = {
            document: 'required',
            phone: 'required',
        }
        let result = new validator(req, rules);
        if (result.passes()) {
            utils.validate_user(req,function(data) {
                if(data.status == 200) {
                    //se valida el balance en dos partes: Aqui es la primera, y se hace para que no envíe correo si la compra es superior al dinero que tenga el usuario.
                    utils.validate_balance(data.message.user_id,function (response_validate_balance) {
                        if(response_validate_balance.status == 200) {
                            return callback({
                                'message': "El saldo que tiene en éste momento es de $" + response_validate_balance.message,
                                'status': 200
                            });
                        }else {
                            return callback({
                                'message': "En este momento no se puede consultar el saldo.",
                                'status': 422
                            });
                        }
                    });
                }else {
                    return callback({
                        'message': data.message,
                        'status': 422
                    });
                }
            });
        } else {
            return callback({
                'message': result.errors.errors,
                'status': 422
            });
        }
    }
};