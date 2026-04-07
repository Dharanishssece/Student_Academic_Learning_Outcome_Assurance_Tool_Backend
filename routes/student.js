const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMyCourses, getMyMarks, getMyOutcomes, uploadCertificate } = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { role } = require('../middleware/role');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const unique = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(protect, role('student'));

router.get('/courses', getMyCourses);
router.get('/marks', getMyMarks);
router.get('/outcomes', getMyOutcomes);
router.post('/upload-certificate', upload.single('certificate'), uploadCertificate);

module.exports = router;
