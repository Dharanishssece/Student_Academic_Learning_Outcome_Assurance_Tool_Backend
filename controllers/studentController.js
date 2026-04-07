const Course = require('../models/Course');
const Marks = require('../models/Marks');
const CLO = require('../models/CLO');
const Assessment = require('../models/Assessment');
const path = require('path');
const fs = require('fs');

// @GET /api/student/courses
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id })
      .populate('facultyId', 'name email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/student/marks
const getMyMarks = async (req, res) => {
  try {
    const marks = await Marks.find({ studentId: req.user._id })
      .populate('courseId', 'courseName courseCode')
      .populate({
        path: 'assessmentId',
        populate: { path: 'cloMapped', select: 'cloNumber description' }
      })
      .sort({ createdAt: -1 });
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/student/outcomes
const getMyOutcomes = async (req, res) => {
  try {
    const courses = await Course.find({ students: req.user._id });
    const outcomes = [];

    for (const course of courses) {
      const clos = await CLO.find({ courseId: course._id });
      const assessments = await Assessment.find({ courseId: course._id });

      const cloResults = await Promise.all(clos.map(async (clo) => {
        const cloAssessments = assessments.filter(a => String(a.cloMapped) === String(clo._id));
        let totalMax = 0, totalObtained = 0;
        for (const assessment of cloAssessments) {
          const mark = await Marks.findOne({ studentId: req.user._id, assessmentId: assessment._id });
          if (mark) {
            totalMax += assessment.maxMarks;
            totalObtained += mark.marksObtained;
          }
        }
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        return {
          cloNumber: clo.cloNumber,
          description: clo.description,
          targetPercentage: clo.targetPercentage,
          achievedPercentage: Math.round(percentage * 100) / 100,
          achieved: percentage >= clo.targetPercentage,
        };
      }));

      outcomes.push({ course: { _id: course._id, courseName: course.courseName, courseCode: course.courseCode }, clos: cloResults });
    }
    res.json(outcomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/student/upload-certificate
const uploadCertificate = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ message: 'Certificate uploaded successfully', filename: req.file.filename, path: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyCourses, getMyMarks, getMyOutcomes, uploadCertificate };
