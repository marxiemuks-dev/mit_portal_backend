const verifyToken = require("../middleware/authJWT");
const announcementController = require('../controller/announcementController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/announcement', announcementController.addAnnouncement);
  app.get('/api/auth/announcement', announcementController.getAnnouncements);
  app.delete('/api/auth/announcement/:id', announcementController.deleteAnnouncement);
  app.patch('/api/auth/announcement/:id', announcementController.markAsRead);
  app.put('/api/auth/announcement/:id', announcementController.updateAnnouncement);
}