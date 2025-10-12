const verifyToken = require("../middleware/authJWT");
const calendarController = require('../controller/calendarController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/calendar', calendarController.addCalendarEvent);
  app.get('/api/auth/calendar', calendarController.getCalendarEvents);
  app.delete('/api/auth/calendar/:id', calendarController.deleteCalendarEvent);
  app.put('/api/auth/calendar/:id', calendarController.updateCalendarEvent);
}