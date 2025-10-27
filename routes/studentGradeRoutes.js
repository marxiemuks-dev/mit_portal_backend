const verifyToken = require("../middleware/authJWT");
const studentGradeController = require('../controller/studentGradeController')

module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });

  app.post('/api/auth/grade', studentGradeController.addStudentGrade);
  app.get('/api/auth/grade', studentGradeController.getStudentGrades);
  app.get('/api/auth/grade/:subject_schedule_id', studentGradeController.getStudentGradesBySchedule);
  app.put("/api/auth/grade/:id", studentGradeController.updateStudentGrade);
  app.get("/api/auth/grade/student/:student_id", studentGradeController.getStudentGradesByStudentId);
  app.get("/api/auth/grade/grade-evaluation/:student_id", studentGradeController.getStudentGradeEvaluation);
  app.get("/api/auth/grade/schedule/all/evaluation", studentGradeController.getGradeForEverySchedule);
}