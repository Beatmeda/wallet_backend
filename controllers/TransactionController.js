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
                }else {
                    return callback({
                        'message': data.message,
                        'status': 200
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
                                'status': 200
                            });
                        }else {
                            let token = Math.random().toString(24).slice(8);//Se genera un token aleatorio con 6 digitos
                            utils.update_user_token(data.message.user_id,token, async function (response_update_user_token) {
                                if(response_update_user_token.status == 200) {
                                    let templatesDir = path.resolve(__dirname, '../utils/templates');
                                    const result =  await email.transporter();
                                    let template = new EmailTemplate(path.join(templatesDir, 'email_confirmation_purchase'));
                                    let params = {
                                        "from": process.env['USER_EMAIL'],
                                        "to": data.message.email,
                                        "subject": 'Confirmación de compra: Correo de prueba',
                                        "token": token + "" + data.message.user_id,//el token enviado al correo es el token de seis digitos aleatorio y se le añade un digo que es el user_id
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
                                        'message': "No fue posible generar el token requerido para envíos de email. Inténtalo más tarde.",
                                        'status': 200
                                    });
                                }
                            });
                        }

                    });
                }else {
                    return callback({
                        'message': data.message,
                        'status': 200
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
    confirmationPurchase: function (req, callback) {
        return callback({
            'message': req.token,
            'status': 200
        });
    }
};