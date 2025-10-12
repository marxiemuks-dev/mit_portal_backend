const verifyToken = require("../middleware/authJWT");
const userController = require('../controller/userController')


module.exports = function(app){
  app.use(function (req, res, next){
    res.header("Access-Control-Allow-Origin");
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next()
  });
  app.post('/api/auth/login', userController.loginUser);
  app.get('/api/auth/users', userController.getAllUsers);
  app.post('/api/auth/users', userController.addUser);
  app.put('/api/auth/users/:id', userController.updateUser)
}