import multer from "multer"

//1. store in the diskstorage => local server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./public/images");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});


//2. Upload the file to local storage {min= 1MB}
export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1000 * 1000,
  },
});
