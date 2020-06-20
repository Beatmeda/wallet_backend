let nodemailer = require('nodemailer');

module.exports = {
    transporter: async function(){
        const result = await nodemailer.createTransport({
            host: process.env['HOST_EMAIL'],
            port: process.env['PORT_EMAIL'],
            secure: true,
            auth: {
                user: process.env['USER_EMAIL'],
                pass: process.env['PASS_EMAIL']
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        return result
    },
}