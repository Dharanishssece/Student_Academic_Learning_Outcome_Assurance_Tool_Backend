const express = require('express');
const router = express.Router();
const {
  getMyCourses, createCLO, getCLOs, createAssessment,
  getAssessments, uploadMarks, getOutcomeAnalysis
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { role } = require('../middleware/role');

router.use(protect, role('faculty'));

router.get('/courses', getMyCourses);
router.post('/create-clo', createCLO);
router.get('/clos/:courseId', getCLOs);
router.post('/create-assessment', createAssessment);
router.get('/assessments/:courseId', getAssessments);
router.post('/upload-marks', uploadMarks);
router.get('/outcome-analysis/:courseId', getOutcomeAnalysis);

module.exports = router;
