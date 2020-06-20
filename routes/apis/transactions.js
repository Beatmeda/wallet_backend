const API_BASE = "/apis/transactions";
const transactions_controller = require("../../controllers/TransactionController");

module.exports = function(app) {
    app.patch(`${API_BASE}/chargeMoney`, (req, res) => {
        transactions_controller.chargeMoney(req.body, function(data) {
            res.json(data);
        });
    });
    app.post(`${API_BASE}/purchase`, (req, res) => {
        transactions_controller.purchase(req.body, function(data) {
            res.json(data);
        });
    });
    app.get(`${API_BASE}/confirmation_purchase/:token`, (req, res) => {
        transactions_controller.confirmationPurchase(req, function(data) {
            res.json(data);
        });
    });
};