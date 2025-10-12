const verifyToken = require("../middleware/authJWT");
const subjectOfferingController = require('../controller/subjectOfferingController')


module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  //app.post('/api/auth/students', studentController.addStudent);
  app.get('/api/auth/subjectOffering', subjectOfferingController.getAllSubjectOfferings);
  app.post('/api/auth/subjectOffering', subjectOfferingController.addSubjectOffering);
}