const User = require('../models/User');
const Course = require('../models/Course');

// @POST /api/admin/add-student
const addStudent = async (req, res) => {
  try {
    const { name, regNumber, department } = req.body;
    if (!name || !regNumber) return res.status(400).json({ message: 'Name and Registration Number required' });

    const email = `${regNumber.toLowerCase()}@student.salo.edu`;
    const password = `Student@${regNumber}`;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Student already exists' });

    const student = await User.create({ name, email, password, role: 'student', department, regNumber });
    res.status(201).json({
      message: 'Student created successfully',
      student: { _id: student._id, name: student.name, email, regNumber, department },
      credentials: { email, password }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/admin/add-faculty
const addFaculty = async (req, res) => {
  try {
    const { name, department } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const namePart = name.toLowerCase().replace(/\s+/g, '.');
    const email = `${namePart}@faculty.salo.edu`;
    const password = `Faculty@${name.split(' ')[0]}123`;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Faculty with this name already exists' });

    const faculty = await User.create({ name, email, password, role: 'faculty', department });
    res.status(201).json({
      message: 'Faculty created successfully',
      faculty: { _id: faculty._id, name: faculty.name, email, department },
      credentials: { email, password }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/admin/create-course
const createCourse = async (req, res) => {
  try {
    const { courseName, courseCode, department } = req.body;
    if (!courseName || !courseCode) return res.status(400).json({ message: 'Course name and code required' });

    const exists = await Course.findOne({ courseCode });
    if (exists) return res.status(400).json({ message: 'Course code already exists' });

    const course = await Course.create({ courseName, courseCode, department, createdBy: req.user._id });
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/admin/assign-faculty
const assignFaculty = async (req, res) => {
  try {
    const { courseId, facultyId } = req.body;
    const course = await Course.findByIdAndUpdate(courseId, { facultyId }, { new: true }).populate('facultyId', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Faculty assigned successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @PUT /api/admin/assign-students
const assignStudents = async (req, res) => {
  try {
    const { courseId, studentIds } = req.body;
    const course = await Course.findByIdAndUpdate(courseId, { $addToSet: { students: { $each: studentIds } } }, { new: true });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Students assigned successfully', course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/admin/courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('facultyId', 'name email')
      .populate('students', 'name email regNumber')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalCourses = await Course.countDocuments();
    res.json({ totalStudents, totalFaculty, totalCourses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addStudent, addFaculty, createCourse, assignFaculty, assignStudents, getUsers, getCourses, getReports, deleteUser };
