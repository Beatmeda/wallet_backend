const API_BASE = "/apis/register";

const register_controller = require("../../controllers/RegisterController");

module.exports = function(app) {
    app.post(`${API_BASE}`, (req, res) => {
        register_controller.register(req.body, function(data) {
            res.json(data);
        });
    });
};