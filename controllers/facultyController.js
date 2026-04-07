const Course = require('../models/Course');
const CLO = require('../models/CLO');
const Assessment = require('../models/Assessment');
const Marks = require('../models/Marks');
const User = require('../models/User');

// @GET /api/faculty/courses
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ facultyId: req.user._id })
      .populate('students', 'name email regNumber')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/faculty/create-clo
const createCLO = async (req, res) => {
  try {
    const { courseId, cloNumber, description, targetPercentage } = req.body;
    const clo = await CLO.create({ courseId, cloNumber, description, targetPercentage });
    res.status(201).json({ message: 'CLO created successfully', clo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/faculty/clos/:courseId
const getCLOs = async (req, res) => {
  try {
    const clos = await CLO.find({ courseId: req.params.courseId }).sort({ cloNumber: 1 });
    res.json(clos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/faculty/create-assessment
const createAssessment = async (req, res) => {
  try {
    const { courseId, title, type, maxMarks, cloMapped, date } = req.body;
    const assessment = await Assessment.create({ courseId, title, type, maxMarks, cloMapped, date });
    res.status(201).json({ message: 'Assessment created successfully', assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/faculty/assessments/:courseId
const getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find({ courseId: req.params.courseId })
      .populate('cloMapped', 'cloNumber description')
      .sort({ date: -1 });
    res.json(assessments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @POST /api/faculty/upload-marks
const uploadMarks = async (req, res) => {
  try {
    const { marksData } = req.body; // [{ studentId, courseId, assessmentId, marksObtained }]
    const ops = marksData.map(m =>
      Marks.findOneAndUpdate(
        { studentId: m.studentId, assessmentId: m.assessmentId },
        { ...m },
        { upsert: true, new: true }
      )
    );
    await Promise.all(ops);
    res.json({ message: 'Marks uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @GET /api/faculty/outcome-analysis/:courseId
const getOutcomeAnalysis = async (req, res) => {
  try {
    const { courseId } = req.params;
    const clos = await CLO.find({ courseId });
    const assessments = await Assessment.find({ courseId });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const studentIds = course.students;
    const totalStudents = studentIds.length;

    const analysis = await Promise.all(clos.map(async (clo) => {
      const cloAssessments = assessments.filter(a => String(a.cloMapped) === String(clo._id));
      let attainedCount = 0;

      for (const stu of studentIds) {
        let totalMax = 0, totalObtained = 0;
        for (const assessment of cloAssessments) {
          const mark = await Marks.findOne({ studentId: stu, assessmentId: assessment._id });
          if (mark) {
            totalMax += assessment.maxMarks;
            totalObtained += mark.marksObtained;
          }
        }
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
        if (percentage >= clo.targetPercentage) attainedCount++;
      }

      const attainmentPercentage = totalStudents > 0 ? (attainedCount / totalStudents) * 100 : 0;
      return {
        cloNumber: clo.cloNumber,
        description: clo.description,
        targetPercentage: clo.targetPercentage,
        attainmentPercentage: Math.round(attainmentPercentage * 100) / 100,
        attained: attainmentPercentage >= clo.targetPercentage,
      };
    }));

    res.json({ courseId, analysis });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyCourses, createCLO, getCLOs, createAssessment, getAssessments, uploadMarks, getOutcomeAnalysis };
