const API_BASE = "/apis/transactions";
const transactions_controller = require("../../controllers/TransactionController");

module.exports = function(app) {
    app.patch(`${API_BASE}/chargeMoney`, (req, res) => {
        transactions_controller.chargeMoney(req.body, function(data) {
            res.json(data);
        });
    });
};