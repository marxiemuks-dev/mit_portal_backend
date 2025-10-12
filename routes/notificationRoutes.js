const verifyToken = require("../middleware/authJWT");
const notificationController = require('../controller/notificationController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/notification', notificationController.addNotification);
  app.get('/api/auth/notification', notificationController.getNotifications);
  app.delete('/api/auth/notification/:id', notificationController.deleteNotification);
  app.patch('/api/auth/notification/:id', notificationController.markAsRead);
  app.put('/api/auth/notification/:id', notificationController.updateNotification);
}