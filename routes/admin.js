const express = require('express');
const router = express.Router();
const {
  addStudent, addFaculty, createCourse, assignFaculty, assignStudents,
  getUsers, getCourses, getReports, deleteUser
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { role } = require('../middleware/role');

router.use(protect, role('admin'));

router.post('/add-student', addStudent);
router.post('/add-faculty', addFaculty);
router.post('/create-course', createCourse);
router.put('/assign-faculty', assignFaculty);
router.put('/assign-students', assignStudents);
router.get('/users', getUsers);
router.get('/courses', getCourses);
router.get('/reports', getReports);
router.delete('/users/:id', deleteUser);

module.exports = router;
