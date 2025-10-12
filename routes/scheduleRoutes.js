const verifyToken = require("../middleware/authJWT");
const scheduleController = require('../controller/scheduleController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/schedule', scheduleController.addSchedule);
  app.get('/api/auth/schedule', scheduleController.getSchedules);
  app.patch('/api/auth/schedule', scheduleController.updateSchedule);
  app.delete('/api/auth/schedule/:id', scheduleController.deleteSchedule);
}