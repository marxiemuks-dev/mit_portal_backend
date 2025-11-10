const verifyToken = require("../middleware/authJWT");
const announcementController = require('../controller/announcementController')
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

  app.post('/api/auth/announcement',[upload.single('image')], announcementController.addAnnouncement);
  app.get('/api/auth/announcement', announcementController.getAnnouncements);
  app.delete('/api/auth/announcement/:id', announcementController.deleteAnnouncement);
  app.patch('/api/auth/announcement/:id', announcementController.markAsRead);
  app.put('/api/auth/announcement/:id', [upload.single('image')], announcementController.updateAnnouncement);
}