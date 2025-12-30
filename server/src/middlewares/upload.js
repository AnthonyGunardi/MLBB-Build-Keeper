const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '../../uploads');
const heroDir = path.join(uploadDir, 'heroes');
const buildDir = path.join(uploadDir, 'builds');

[uploadDir, heroDir, buildDir].forEach(dir => {
  /* istanbul ignore next -- @preserve Startup code: directories already exist when tests run */
  if (!fs.existsSync(dir)) {
    /* istanbul ignore next -- @preserve Startup code: mkdir only runs on fresh deployment */
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'hero_image' || file.fieldname === 'role_icon') {
      cb(null, heroDir);
    } else if (file.fieldname === 'build_image') {
      cb(null, buildDir);
    } else {
      cb(null, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Images only (jpeg, jpg, png)!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: fileFilter
});

module.exports = upload;
