const verifyToken = require("../middleware/authJWT");
const enrollmentController = require('../controller/enrollmentController')


module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/enrollment', enrollmentController.enrollStudent);
  app.get('/api/auth/enrollment', enrollmentController.getAllEnrollments);
  app.get('/api/auth/enrollment/filter', enrollmentController.getEnrollmentsBySemesterAndYear);
  app.put('/api/auth/enrollment', enrollmentController.updateEnrollment);
  app.get('/api/auth/enrollment/:student_id', enrollmentController.getEnrollmentById);
  app.delete('/api/auth/enrollment/:id', enrollmentController.deleteEnrollment);
}