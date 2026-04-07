const mongoose = require('mongoose');

const cloSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  cloNumber: { type: Number, required: true },
  description: { type: String, required: true },
  targetPercentage: { type: Number, default: 60 },
}, { timestamps: true });

module.exports = mongoose.model('CLO', cloSchema);
