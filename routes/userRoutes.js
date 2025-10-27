const verifyToken = require("../middleware/authJWT");
const userController = require('../controller/userController')
const multer = require("multer");

// Configure storage for multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Setting destination...");
        cb(null, "public/assets");
    },
    filename: (req, file, cb) => {
        console.log("Processing filename...");
        cb(null, `${file.originalname}`);
    },
});

// Create the multer instance
const upload = multer({storage});

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
  app.put('/api/auth/users/picture/:id', [upload.single('profilePicture')], userController.updateProfile)
  app.patch('/api/auth/users/reset/password', userController.updateUserPassword)
}