const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Assignment', 'Quiz', 'Exam'], required: true },
  maxMarks: { type: Number, required: true },
  cloMapped: { type: mongoose.Schema.Types.ObjectId, ref: 'CLO', required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Assessment', assessmentSchema);
