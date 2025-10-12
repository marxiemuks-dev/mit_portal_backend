const verifyToken = require("../middleware/authJWT");
const billingController = require('../controller/billingController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/billing', billingController.addBilling);
  app.get('/api/auth/billing', billingController.getAllBillings);
  app.post('/api/auth/payment', billingController.addPayment);
  app.put('/api/auth/billing/:billing_id', billingController.updateBilling);
}